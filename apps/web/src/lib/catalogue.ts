// The one place the storefront reads products from.
// With the shop backend connected (see lib/api.ts) products, prices and live stock come from Medusa.
// Without it, or if the backend cannot be reached, the built-in demo products in src/data/products.ts are used.
import { products as builtIn, type Colour, type Product, type ProductImage, type Sleeve } from "@/data/products";
import { backendOn, storeApi } from "@/lib/api";
import { SIZES, type Size, type StockBySize } from "@/lib/types";

export type ProductFilter = { sleeve?: Sleeve; colour?: Colour };

export const sleeveOptions: Sleeve[] = ["Long sleeve", "Short sleeve"];
export const colourOptions: Colour[] = ["White", "Cream", "Black", "Navy", "Blue", "Charcoal", "Pink", "Green"];

/* ---------- backend -> Product ---------- */
type ApiVariant = {
  id: string;
  title: string;
  inventory_quantity?: number | null;
  calculated_price?: { calculated_amount?: number | null } | null;
  options?: { value?: string }[];
};
type ApiProduct = {
  id: string;
  title: string;
  subtitle?: string | null;
  handle: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: { url: string }[];
  metadata?: Record<string, unknown> | null;
  variants?: ApiVariant[];
};

const FIELDS = [
  "id", "title", "subtitle", "handle", "description", "thumbnail", "metadata", "*images",
  "*variants", "+variants.inventory_quantity", "*variants.calculated_price", "*variants.options",
].join(",");

let regionId: Promise<string> | undefined;
function getRegionId() {
  regionId ??= storeApi<{ regions: { id: string; currency_code: string }[] }>("/store/regions", { revalidate: 3600 })
    .then((r) => (r.regions.find((x) => x.currency_code === "ghs") ?? r.regions[0]).id)
    .catch((e) => {
      regionId = undefined;
      throw e;
    });
  return regionId;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Product photos seeded from the site itself are served from the site (fast, already optimised). */
function imageSrc(url: string) {
  const at = url.indexOf("/images/products/");
  return at >= 0 ? url.slice(at) : url;
}

function fromApi(p: ApiProduct): Product {
  const m = p.metadata ?? {};
  const kinds = Array.isArray(m.image_kinds) ? (m.image_kinds as string[]) : [];
  const urls = (p.images?.length ? p.images.map((i) => i.url) : p.thumbnail ? [p.thumbnail] : []).filter(Boolean);
  const images: ProductImage[] = urls.map((url, i) => ({
    src: imageSrc(url),
    alt: p.title,
    kind: kinds[i] === "flat" ? "flat" : "photo",
  }));

  const stock = Object.fromEntries(SIZES.map((s) => [s, 0])) as StockBySize;
  const variantIds: Record<string, string> = {};
  let price: number | undefined;
  for (const v of p.variants ?? []) {
    const size = (v.options?.[0]?.value ?? v.title) as Size;
    if (!SIZES.includes(size)) continue;
    variantIds[size] = v.id;
    stock[size] = Math.max(0, v.inventory_quantity ?? 0);
    price ??= v.calculated_price?.calculated_amount ?? undefined;
  }

  const preorder = m.preorder === true;
  const badge = str(m.badge);
  return {
    id: p.id,
    variantIds,
    slug: p.handle,
    name: p.title,
    localName: str(m.local_name) ?? str(p.subtitle),
    localMeaning: str(m.local_meaning),
    note: str(m.note) ?? "",
    description: p.description ?? "",
    sleeve: (str(m.sleeve) as Sleeve) ?? "Long sleeve",
    colour: (str(m.colour) as Colour) ?? "White",
    includesTrousers: false,
    badge: badge === "New" || badge === "Signature" || badge === "Popular" || badge === "Limited edition" ? badge : undefined,
    features: Array.isArray(m.features) ? (m.features as string[]) : [],
    price,
    stock,
    preorder: preorder ? { open: true, readyBy: str(m.ready_by) } : undefined,
    images: images.length ? images : [{ src: "/brand/logo-monogram-white.png", alt: p.title, kind: "flat" }],
  };
}

/** Keep the launch order from the demo list; designs added later follow, newest last. */
function sortLikeCatalogue(list: Product[]) {
  const rank = (p: Product) => {
    const i = builtIn.findIndex((b) => b.slug === p.slug);
    return i === -1 ? builtIn.length : i;
  };
  return [...list].sort((a, b) => rank(a) - rank(b));
}

async function loadAll(): Promise<Product[]> {
  if (!backendOn) return builtIn;
  try {
    const region = await getRegionId();
    const { products } = await storeApi<{ products: ApiProduct[] }>(
      `/store/products?limit=100&region_id=${region}&fields=${encodeURIComponent(FIELDS)}`,
      { revalidate: 60 },
    );
    return products.length ? sortLikeCatalogue(products.map(fromApi)) : builtIn;
  } catch (error) {
    console.error("Could not load products from the shop backend; showing the built-in list.", error);
    return builtIn;
  }
}

/* ---------- public API (unchanged for the components) ---------- */
export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const all = await loadAll();
  return all.filter((p) => (!filter.sleeve || p.sleeve === filter.sleeve) && (!filter.colour || p.colour === filter.colour));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await loadAll()).find((p) => p.slug === slug);
}

export async function getRelatedProducts(slug: string, count = 3): Promise<Product[]> {
  const all = await loadAll();
  const current = all.find((p) => p.slug === slug);
  const others = all.filter((p) => p.slug !== slug);
  // same sleeve first, then the rest
  others.sort((a, b) => Number(b.sleeve === current?.sleeve) - Number(a.sleeve === current?.sleeve));
  return others.slice(0, count);
}

export { formatPrice } from "@/lib/format";
