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

export function stockLabel(units: number): { text: string; tone: "ok" | "low" | "out" } {
  if (units <= 0) return { text: "Out of stock", tone: "out" };
  if (units <= 3) return { text: `Only ${units} left`, tone: "low" };
  return { text: "In stock", tone: "ok" };
}

export function firstAvailableSize(p: Pick<Product, "stock">): Size | undefined {
  return SIZES.find((s) => (p.stock[s] ?? 0) > 0);
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
