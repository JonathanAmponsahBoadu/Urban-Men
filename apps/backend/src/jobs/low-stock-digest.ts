import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { notifyAdmins } from "../lib/notify";

const THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? 3);

/**
 * Every morning, email the administrators (and inventory managers' phones) a list of sizes that are low or sold out.
 * Pre-order designs are skipped: they are made to order and their stock is not tracked.
 */
export default async function lowStockDigest(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["title", "sku", "manage_inventory", "product.title", "product.subtitle", "inventory_items.inventory.location_levels.stocked_quantity"],
    filters: { manage_inventory: true },
  });

  const out: string[] = [];
  const low: string[] = [];
  for (const v of variants) {
    const levels = v.inventory_items?.flatMap((i) => i?.inventory?.location_levels ?? []) ?? [];
    if (levels.length === 0) continue;
    const qty = levels.reduce((n, l) => n + Number(l?.stocked_quantity ?? 0), 0);
    const name = `${v.product?.subtitle ?? v.product?.title} · ${v.title}`;
    if (qty <= 0) out.push(`${name}: sold out`);
    else if (qty <= THRESHOLD) low.push(`${name}: ${qty} left`);
  }
  if (out.length === 0 && low.length === 0) return;

  await notifyAdmins(container, {
    area: "inventory",
    title: `Stock check: ${out.length} sold out, ${low.length} running low`,
    lines: [...out, ...low].slice(0, 40),
    path: "/inventory",
    push: { title: "Stock check", body: `${out.length} sold out, ${low.length} running low` },
  });
}

export const config = { name: "low-stock-digest", schedule: "0 8 * * *" };
