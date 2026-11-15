"use client";

import Image from "next/image";
import Link from "next/link";
import { OrderExtras } from "@/components/OrderExtras";
import { OrderTimeline } from "@/components/OrderTimeline";
import { whatsappUrl } from "@/data/site";
import { formatDate, formatPrice } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/storage";
import { ordersStore, useCurrentUser } from "@/lib/stores";
import { btnOutline, btnPrimary } from "@/lib/ui";

const next = [
  "We contact you by phone or WhatsApp to confirm your sizes, the price and the delivery cost.",
  "We prepare your order (or make it, for pre-orders and custom styles).",
  "We deliver it to you and keep you posted along the way.",
];

export function OrderConfirmation({ id }: { id: string }) {
  const hydrated = useHydrated();
  const orders = useStore(ordersStore);
  const user = useCurrentUser();
  const order = orders.find((o) => o.id === id);

  if (!hydrated) return <p className="py-24 text-center text-mist">Loading…</p>;
  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl">We could not find that order</h1>
        <p className="mt-3 text-mist">It may have been placed on another device. You can look it up with your order number and phone number.</p>
        <Link href="/track" className={`${btnPrimary} mt-8`}>Track an order</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <div className="text-center">
        <div aria-hidden className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold text-3xl font-bold text-navy">✓</div>
        <p className="mt-6 text-xs uppercase tracking-[0.4em] text-gold">Order placed</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Thank you{order.delivery?.name ? `, ${order.delivery.name.split(" ")[0]}` : ""}.</h1>
        <p className="mt-3 text-lg text-mist">
          Your order number is <span className="font-semibold text-ivory">{order.id}</span>. Keep it to track your order.
        </p>
      </div>

      <section className="mt-10 rounded-sm border border-white/10 bg-navy-soft p-6">
        <OrderTimeline status={order.status} />
        <ul className="mt-6 divide-y divide-white/10 border-t border-white/10">
          {order.lines.map((l) => (
            <li key={`${l.slug}-${l.size}`} className="flex items-center gap-4 py-4">
              <div className="relative aspect-4/5 w-14 shrink-0 overflow-hidden rounded-sm bg-navy-deep">
                <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p>{l.name}</p>
                <p className="text-sm text-mist">Size {l.size} · Qty {l.qty}{l.preorder ? " · Pre-order" : ""}</p>
              </div>
              {l.price !== undefined && <p className="text-gold">{formatPrice(l.price * l.qty)}</p>}
            </li>
          ))}
        </ul>
        <div className="mb-4"><OrderExtras order={order} /></div>
        <p className="flex items-baseline justify-between border-t border-white/10 pt-4">
          <span className="text-sm text-mist">Placed {formatDate(order.createdAt)}{order.voucher && ` · voucher ${order.voucher}`}</span>
          <span>
            Total <span className="text-xl font-semibold text-gold">{order.total !== undefined ? formatPrice(order.total) : "to be confirmed"}</span>
          </span>
        </p>
        {order.balance ? (
          <p className="mt-3 rounded-md border border-gold/40 bg-gold/5 px-4 py-3 text-sm">
            <span className="font-semibold">Pre-order:</span> {formatPrice(order.paidNow)} paid now, {formatPrice(order.balance)} to pay before delivery
            {order.readyBy ? <>. Expected: {order.readyBy}</> : null}.
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">What happens next</h2>
        <ol className="mt-4 space-y-3">
          {next.map((t, i) => (
            <li key={t} className="flex gap-4 text-mist">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/60 text-sm text-gold">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      {!user && (
        <p className="mt-10 rounded-md border border-white/15 bg-navy-soft px-4 py-3 text-sm text-mist">
          Want to follow your orders more easily next time? <Link href="/signup" className="text-gold underline-offset-4 hover:underline">Create an account</Link>.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={`/order/${order.id}/invoice`} className={btnPrimary}>View receipt</Link>
        <Link href="/track" className={btnOutline}>Track order</Link>
        <a href={whatsappUrl(`Hello Urban Men, I am asking about order ${order.id}.`)} className={btnOutline}>Ask on WhatsApp</a>
        <Link href="/shop" className={btnOutline}>Keep shopping</Link>
      </div>
    </main>
  );
}
