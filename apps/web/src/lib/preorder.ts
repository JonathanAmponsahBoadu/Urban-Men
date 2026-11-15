import { roundMoney } from "@/lib/format";

type SplitLine = { price?: number; qty: number; preorder?: boolean };

/**
 * Splits an order into what is paid now and what is paid later.
 * Normal items are paid in full now; pre-order items pay `depositPercent` now and the rest before delivery.
 * Returns undefined while any line has no price (the price is then confirmed on WhatsApp).
 */
export function paymentSplit(lines: SplitLine[], depositPercent: number, discount = 0) {
  if (lines.some((l) => l.price === undefined)) return undefined;
  const regular = lines.filter((l) => !l.preorder).reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);
  const pre = lines.filter((l) => l.preorder).reduce((s, l) => s + (l.price ?? 0) * l.qty, 0);
  const pct = Math.min(100, Math.max(0, depositPercent));
  const total = roundMoney(regular + pre - discount);
  // the voucher comes off the pre-order part last, so the deposit never goes negative
  const preAfter = Math.max(0, roundMoney(pre - Math.max(0, discount - regular)));
  const deposit = roundMoney((preAfter * pct) / 100);
  const dueNow = roundMoney(total - preAfter + deposit);
  return { regular, preorder: pre, total, dueNow, balance: roundMoney(total - dueNow), hasPreorder: pre > 0 };
}
