import type { Product } from "@/data/products";
import { SIZES, type Size } from "@/lib/types";

/** Ghana cedi, e.g. "GH₵ 300.00". */
export function formatPrice(price?: number) {
  if (price === undefined) return null;
  const [whole, dec] = price.toFixed(2).split(".");
  return `GH₵ ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec}`;
}

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
export const unitsFor = (p: Pick<Product, "stock" | "preorder">, size: Size) => (isPreorder(p) ? PREORDER_CAP : (p.stock[size] ?? 0));
export const orderable = (p: Pick<Product, "stock" | "preorder">) => isPreorder(p) || totalStock(p) > 0;
export const firstAvailableSize = (p: Pick<Product, "stock" | "preorder">): Size | undefined => SIZES.find((s) => unitsFor(p, s) > 0);

/** The name shown first: the local (Twi) name when there is one. */
export const displayName = (p: Pick<Product, "name" | "localName">) => p.localName?.trim() || p.name;
/** "Odehye (The Emerald Kente Shirt)", used on orders and messages. */
export const fullName = (p: Pick<Product, "name" | "localName">) => (p.localName?.trim() ? `${p.localName.trim()} (${p.name})` : p.name);

export function stockLabel(units: number, preorder = false): { text: string; tone: "ok" | "low" | "out" } {
  if (preorder) return { text: "Open for pre-order", tone: "ok" };
  if (units <= 0) return { text: "Out of stock", tone: "out" };
  if (units <= 3) return { text: `Only ${units} left`, tone: "low" };
  return { text: "In stock", tone: "ok" };
}

type SplitLine = { price?: number; qty: number; preorder?: boolean };

/** What is paid now and what is left before delivery (pre-order deposit). */
export function paymentSplit(lines: SplitLine[], depositPercent: number, discount = 0) {
  if (lines.some((l) => l.price === undefined)) return undefined;
  const regular = lines.filter((l) => !l.preorder).reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);
  const pre = lines.filter((l) => l.preorder).reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);
  const pct = Math.min(100, Math.max(0, depositPercent));
  const total = roundMoney(regular + pre - discount);
  const preAfter = Math.max(0, roundMoney(pre - Math.max(0, discount - regular)));
  const deposit = roundMoney((preAfter * pct) / 100);
  const dueNow = roundMoney(total - preAfter + deposit);
  return { total, dueNow, balance: roundMoney(total - dueNow), hasPreorder: pre > 0 };
}
