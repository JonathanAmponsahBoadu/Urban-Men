// The one place the storefront reads products from.
// Today this reads src/data/products.ts. When the backend is connected, only
// this file changes: components keep calling the same functions.
import { products, type Colour, type Product, type Sleeve } from "@/data/products";

export type ProductFilter = { sleeve?: Sleeve; colour?: Colour };

export const sleeveOptions: Sleeve[] = ["Long sleeve", "Short sleeve"];
export const colourOptions: Colour[] = ["White", "Cream", "Black", "Navy", "Blue", "Charcoal"];

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  return products.filter(
    (p) => (!filter.sleeve || p.sleeve === filter.sleeve) && (!filter.colour || p.colour === filter.colour),
  );
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getRelatedProducts(slug: string, count = 3): Promise<Product[]> {
  const current = products.find((p) => p.slug === slug);
  const others = products.filter((p) => p.slug !== slug);
  // same sleeve first, then the rest
  others.sort((a, b) => Number(b.sleeve === current?.sleeve) - Number(a.sleeve === current?.sleeve));
  return others.slice(0, count);
}

export { formatPrice } from "@/lib/format";
