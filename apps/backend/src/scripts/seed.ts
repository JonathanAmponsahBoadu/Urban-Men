import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import catalogue from "./catalogue.json";

/**
 * Sets up the Urban Men shop in Ghana: cedi store, Ghana region, one stock location (Accra), delivery,
 * a Shirts category, a Size option and the nine launch designs with stock per size.
 *
 * Run once:   npx medusa exec ./src/scripts/seed.ts
 * Safe to run again: it skips anything that already exists.
 *
 * PLACEHOLDERS (same as the website): every price is GH₵ 300, every size has 10 in stock, and delivery is
 * free in the system (the real cost is confirmed with the customer until Yango/Bolt pricing is built).
 * Local names are PROPOSED Twi names and need confirming.
 */
const SIZES = ["L", "XL", "2XL", "3XL"] as const;
const STOREFRONT_URL = (process.env.STOREFRONT_URL ?? "https://urban-men.vercel.app").replace(/\/$/, "");

type Item = {
  slug: string;
  name: string;
  localName?: string;
  localMeaning?: string;
  note: string;
  description: string;
  sleeve: string;
  colour: string;
  includesTrousers: boolean;
  badge?: string;
  price?: number;
  features: string[];
  preorder?: { open: boolean; readyBy?: string };
  stock: Record<(typeof SIZES)[number], number>;
  images: { src: string; alt: string; kind: string }[];
};
const items = catalogue as Item[];

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const storeModule = container.resolve(Modules.STORE);
  const fulfillment = container.resolve(Modules.FULFILLMENT);
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL);
  const hasPaystack = Boolean(process.env.PAYSTACK_SECRET_KEY);

  /* ---------- sales channel ---------- */
  // One sales channel per route to market (from the business plan), so orders and KPIs can be split by channel.
  const channelDefs = [
    { name: "Website", description: "urban-men.vercel.app" },
    { name: "Mobile app", description: "The Android app (iOS later)" },
    { name: "WhatsApp Business", description: "Orders taken in WhatsApp chats" },
    { name: "Instagram & Facebook", description: "Instagram Shop, Facebook and social ads" },
    { name: "TikTok", description: "Added when TikTok selling starts" },
    { name: "Corporate orders", description: "Staff attire and other bulk orders" },
  ];
  const channels = await salesChannelModule.listSalesChannels({});
  const missingChannels = channelDefs.filter((d) => !channels.some((c) => c.name === d.name));
  if (missingChannels.length) {
    await createSalesChannelsWorkflow(container).run({ input: { salesChannelsData: missingChannels } });
    logger.info(`Created ${missingChannels.length} sales channels.`);
  }
  const allChannels = await salesChannelModule.listSalesChannels({});
  const channel = allChannels.find((c) => c.name === "Website")!;
  const appChannel = allChannels.find((c) => c.name === "Mobile app")!;

  /* ---------- store (cedi) ---------- */
  const [store] = await storeModule.listStores();
  if (store) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: "Urban Men Apparel",
          supported_currencies: [{ currency_code: "ghs", is_default: true }],
          default_sales_channel_id: channel.id,
        },
      },
    });
  } else {
    logger.warn("No store found. Run `npx medusa db:migrate` first.");
    return;
  }

  /* ---------- publishable API keys: one per app, each tied to ONE sales channel ---------- */
  // Medusa needs a single sales channel per key to work out stock, and it keeps website and app orders apart.
  const apiKeyModule = container.resolve(Modules.API_KEY);
  const ensureKey = async (title: string, channelId: string, legacyTitle?: string) => {
    let [found] = await apiKeyModule.listApiKeys({ title, type: "publishable" });
    if (!found && legacyTitle) {
      // an earlier version shared one key between both channels: keep its token for the website
      const [legacy] = await apiKeyModule.listApiKeys({ title: legacyTitle, type: "publishable" });
      if (legacy) {
        await apiKeyModule.updateApiKeys(legacy.id, { title });
        await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: legacy.id, remove: [appChannel.id] } });
        [found] = await apiKeyModule.listApiKeys({ title, type: "publishable" });
      }
    }
    if (!found) {
      const { result } = await createApiKeysWorkflow(container).run({ input: { api_keys: [{ title, type: "publishable", created_by: "" }] } });
      found = result[0];
      await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: found.id, add: [channelId] } });
    }
    return found;
  };
  const key = await ensureKey("Urban Men website", channel.id, "Urban Men storefronts");
  const appKey = await ensureKey("Urban Men mobile app", appChannel.id);

  /* ---------- region + tax ---------- */
  const regionModule = container.resolve(Modules.REGION);
  let [region] = await regionModule.listRegions({ name: "Ghana" });
  if (region && hasPaystack) {
    // Paystack key added after the first seed: switch the region over to real Mobile Money
    const { data: current } = await query.graph({ entity: "region", fields: ["id", "payment_providers.id"], filters: { id: region.id } });
    const ids = (current[0]?.payment_providers ?? []).map((p) => p?.id);
    if (!ids.includes("pp_paystack_momo")) {
      await updateRegionsWorkflow(container).run({
        input: { selector: { id: region.id }, update: { payment_providers: ["pp_paystack_momo"] } },
      });
      logger.info("Ghana region now takes Mobile Money through Paystack.");
    }
  }
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Ghana",
            currency_code: "ghs",
            countries: ["gh"],
            // the Paystack provider is only registered when PAYSTACK_SECRET_KEY is set (see medusa-config.ts)
            payment_providers: [hasPaystack ? "pp_paystack_momo" : "pp_system_default"],
          },
        ],
      },
    });
    region = result[0];
    await createTaxRegionsWorkflow(container).run({ input: [{ country_code: "gh", provider_id: "tp_system" }] });
    logger.info("Created the Ghana region.");
  }

  /* ---------- stock location + delivery ---------- */
  const stockModule = container.resolve(Modules.STOCK_LOCATION);
  let [location] = await stockModule.listStockLocations({ name: "Accra" });
  if (!location) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: { locations: [{ name: "Accra", address: { city: "Accra", country_code: "GH", address_1: "" } }] },
    });
    location = result[0];
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });

    const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] });
    const set = await fulfillment.createFulfillmentSets({
      name: "Ghana delivery",
      type: "shipping",
      service_zones: [{ name: "Ghana", geo_zones: [{ country_code: "gh", type: "country" }] }],
    });
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
    });
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Delivery (cost confirmed with you)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: set.service_zones[0].id,
          shipping_profile_id: profiles[0].id,
          type: { label: "Delivery", description: "We confirm the delivery cost and time with you.", code: "delivery" },
          prices: [
            { currency_code: "ghs", amount: 0 },
            { region_id: region.id, amount: 0 },
          ],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
    await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: location.id, add: allChannels.map((c) => c.id) } });
    logger.info("Created the Accra stock location and delivery.");
  }

  /* ---------- category + size option ---------- */
  const categoryModule = container.resolve(Modules.PRODUCT);
  let [shirts] = await categoryModule.listProductCategories({ name: "Shirts" });
  if (!shirts) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{ name: "Shirts", is_active: true }] },
    });
    shirts = result[0];
  }
  const { data: existingOptions } = await query.graph({ entity: "product_option", fields: ["id", "title"], filters: { title: "Size" } });
  let sizeOptionId = existingOptions[0]?.id as string | undefined;
  if (!sizeOptionId) {
    const { result } = await createProductOptionsWorkflow(container).run({
      input: { product_options: [{ title: "Size", values: [...SIZES] }] },
    });
    sizeOptionId = result[0].id;
  }

  /* ---------- products ---------- */
  const { data: profiles } = await query.graph({ entity: "shipping_profile", fields: ["id"] });
  const { data: have } = await query.graph({ entity: "product", fields: ["handle"] });
  const haveHandles = new Set(have.map((p) => p.handle));
  const fresh = items.filter((p) => !haveHandles.has(p.slug));

  if (fresh.length > 0) {
    await createProductsWorkflow(container).run({
      input: {
        products: fresh.map((p) => {
          const pre = Boolean(p.preorder?.open);
          return {
            title: p.name,
            subtitle: p.localName ?? undefined,
            handle: p.slug,
            description: p.description,
            status: ProductStatus.PUBLISHED,
            category_ids: [shirts.id],
            shipping_profile_id: profiles[0].id,
            thumbnail: `${STOREFRONT_URL}${p.images[0].src}`,
            images: p.images.map((i) => ({ url: `${STOREFRONT_URL}${i.src}` })),
            options: [{ id: sizeOptionId! }],
            // What the web and mobile apps show besides the standard product fields
            metadata: {
              local_name: p.localName ?? null,
              local_meaning: p.localMeaning ?? null,
              note: p.note,
              sleeve: p.sleeve,
              colour: p.colour,
              includes_trousers: p.includesTrousers,
              badge: p.badge ?? null,
              features: p.features,
              preorder: pre,
              ready_by: p.preorder?.readyBy ?? null,
              image_kinds: p.images.map((i) => i.kind),
            },
            variants: SIZES.map((size) => ({
              title: size,
              sku: `UM-${p.slug}-${size}`.toUpperCase(),
              options: { Size: size },
              // pre-order designs are made to order: no stock is tracked for them
              manage_inventory: !pre,
              allow_backorder: false,
              prices: [{ amount: p.price ?? 300, currency_code: "ghs" }],
            })),
            sales_channels: [{ id: channel.id }, { id: appChannel.id }],
          };
        }),
      },
    });
    logger.info(`Created ${fresh.length} products.`);

    /* ---------- stock levels (10 per size, placeholder) ---------- */
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["sku", "manage_inventory", "inventory_items.inventory_item_id"],
      filters: { sku: fresh.flatMap((p) => SIZES.map((s) => `UM-${p.slug}-${s}`.toUpperCase())) },
    });
    const levels = variants
      .filter((v) => v.manage_inventory)
      .flatMap((v) => {
        const [, slugPart] = /^UM-(.+)-(S|M|L|XL|XXL)$/.exec(v.sku ?? "") ?? [];
        const size = (v.sku ?? "").split("-").pop() as (typeof SIZES)[number];
        const item = items.find((c) => c.slug.toUpperCase() === slugPart);
        const inventoryItemId = v.inventory_items?.[0]?.inventory_item_id;
        if (!item || !inventoryItemId) return [];
        return [{ location_id: location.id, inventory_item_id: inventoryItemId, stocked_quantity: item.stock[size] ?? 10 }];
      });
    if (levels.length) await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } });
    logger.info(`Set stock for ${levels.length} variants.`);
  } else {
    logger.info("All products already exist.");
  }

  logger.info(`Done. Website publishable key: ${key.token}`);
  logger.info(`Done. Mobile app publishable key: ${appKey.token}`);
}
