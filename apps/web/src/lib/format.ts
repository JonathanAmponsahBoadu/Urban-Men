import type { Product } from "@/data/products";
import { SIZES, type Review, type Size } from "@/lib/types";

/** Ghana cedi, e.g. "GH₵ 300.00" (₵ is the cedi sign). */
export function formatPrice(price?: number) {
  return price === undefined
    ? null
    : `GH₵ ${price.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Round to whole pesewas to avoid floating-point drift. */
export const roundMoney = (n: number) => Math.round(n * 100) / 100;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function totalStock(p: Pick<Product, "stock">) {
  return SIZES.reduce((n, s) => n + (p.stock[s] ?? 0), 0);
}

/** Pre-order items are made after ordering, so there is no stock cap on them. */
export const PREORDER_CAP = 99;
export const isPreorder = (p: Pick<Product, "preorder">) => Boolean(p.preorder?.open);
/** Units a shopper can order in a size (the real stock, or the pre-order cap). */
export const unitsFor = (p: Pick<Product, "stock" | "preorder">, size: Size) => (isPreorder(p) ? PREORDER_CAP : (p.stock[size] ?? 0));
/** Anything orderable at all: in stock in some size, or open for pre-order. */
export const orderable = (p: Pick<Product, "stock" | "preorder">) => isPreorder(p) || totalStock(p) > 0;

/** The name shown first: the local name when there is one. */
export const displayName = (p: Pick<Product, "name" | "localName">) => p.localName?.trim() || p.name;
/** Local + descriptive name, for orders, receipts and messages: "Odehye (The Emerald Kente Shirt)". */
export const fullName = (p: Pick<Product, "name" | "localName">) => (p.localName?.trim() ? `${p.localName.trim()} (${p.name})` : p.name);

export function stockLabel(units: number, preorder = false): { text: string; tone: "ok" | "low" | "out" } {
  if (preorder) return { text: "Open for pre-order", tone: "ok" };
  if (units <= 0) return { text: "Out of stock", tone: "out" };
  if (units <= 3) return { text: `Only ${units} left`, tone: "low" };
  return { text: "In stock", tone: "ok" };
}

export function firstAvailableSize(p: Pick<Product, "stock" | "preorder">): Size | undefined {
  return SIZES.find((s) => unitsFor(p, s) > 0);
}

export function summarizeReviews(reviews: Review[]) {
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));
  return { count, average, distribution };
}
