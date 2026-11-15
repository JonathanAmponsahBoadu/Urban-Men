"use client";

import Link from "next/link";
import { site } from "@/data/site";
import { formatDate, formatPrice } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/storage";
import { ordersStore } from "@/lib/stores";
import { btnPrimary } from "@/lib/ui";

/** Printable receipt. "Print" lets the customer save it as a PDF. */
export function Invoice({ id }: { id: string }) {
  const hydrated = useHydrated();
  const orders = useStore(ordersStore);
  const order = orders.find((o) => o.id === id);

  if (!hydrated) return <p className="py-24 text-center text-mist">Loading…</p>;
  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl">Receipt not found</h1>
        <Link href="/track" className={`${btnPrimary} mt-8`}>Track an order</Link>
      </main>
    );
  }

  const subtotal = order.lines.every((l) => l.price !== undefined) ? order.lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0) : undefined;
  const d = order.delivery;

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-10">
      <div className="no-print mb-6 flex items-center justify-between gap-3">
        <Link href={`/order/${order.id}`} className="text-sm text-mist hover:text-gold">← Back to your order</Link>
        <button type="button" onClick={() => window.print()} className={btnPrimary}>Print / save as PDF</button>
      </div>

      <article className="invoice rounded-sm bg-[#fff] p-8 text-[#171715] shadow-xl md:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-black/15 pb-6">
          <div>
            <p className="font-display text-3xl tracking-[0.15em]">URBAN MEN</p>
            <p className="text-xs tracking-[0.3em] text-black/60">APPAREL · GHANA</p>
            <p className="mt-3 text-sm text-black/70">{site.phoneDisplay}<br />instagram.com/{site.instagramHandle}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">Receipt</p>
            <p className="mt-1 text-sm text-black/70">No. {order.id}<br />{formatDate(order.createdAt)}</p>
          </div>
        </header>

        {d && (
          <section className="mt-6 text-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-black/55">Billed and delivered to</p>
            <p className="mt-1 font-semibold">{d.name}</p>
            <p>{d.address}{d.region ? `, ${d.region}` : ""}{d.gps ? ` (${d.gps})` : ""}</p>
            <p>{d.phone}{d.email ? ` · ${d.email}` : ""}</p>
          </section>
        )}

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/20 text-xs uppercase tracking-[0.2em] text-black/55">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-center font-medium">Size</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l) => (
              <tr key={`${l.slug}-${l.size}`} className="border-b border-black/10">
                <td className="py-3 pr-2">{l.name}</td>
                <td className="py-3 text-center">{l.size}</td>
                <td className="py-3 text-center">{l.qty}</td>
                <td className="py-3 text-right">{formatPrice(l.price) ?? "–"}</td>
                <td className="py-3 text-right">{l.price !== undefined ? formatPrice(l.price * l.qty) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-6 w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-black/60">Subtotal</dt><dd>{subtotal !== undefined ? formatPrice(subtotal) : "To confirm"}</dd></div>
          {order.discount ? <div className="flex justify-between"><dt className="text-black/60">Voucher {order.voucher}</dt><dd>− {formatPrice(order.discount)}</dd></div> : null}
          <div className="flex justify-between"><dt className="text-black/60">Delivery</dt><dd>To be confirmed</dd></div>
          <div className="flex justify-between border-t border-black/20 pt-3 text-base font-semibold"><dt>Total</dt><dd>{order.total !== undefined ? formatPrice(order.total) : "To confirm"}</dd></div>
          {order.balance ? (
            <>
              <div className="flex justify-between"><dt className="text-black/60">Paid now (pre-order deposit)</dt><dd>{formatPrice(order.paidNow)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Balance before delivery</dt><dd>{formatPrice(order.balance)}</dd></div>
            </>
          ) : null}
        </dl>

        <p className="mt-8 text-xs text-black/60">
          Payment:{" "}
          {order.payment?.method === "momo"
            ? `${order.payment.network} Mobile Money${order.payment.demo ? " (demo, nothing was charged)" : ""}`
            : "to be arranged on WhatsApp"}
          . Thank you for choosing Urban Men.
        </p>
      </article>
    </main>
  );
}
