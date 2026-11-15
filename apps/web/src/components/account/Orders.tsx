"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ReturnForm } from "@/components/account/ReturnForm";
import { OrderExtras } from "@/components/OrderExtras";
import { OrderTimeline } from "@/components/OrderTimeline";
import { whatsappUrl } from "@/data/site";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { ordersStore, returnsStore, setOrderStatus, useCurrentUser } from "@/lib/stores";
import { card } from "@/lib/ui";

const tone: Record<string, string> = {
  "Awaiting confirmation": "bg-amber-400/15 text-amber-700 dark:text-amber-300",
  Confirmed: "bg-sky-400/15 text-sky-700 dark:text-sky-300",
  "In production": "bg-sky-400/15 text-sky-700 dark:text-sky-300",
  "Out for delivery": "bg-sky-400/15 text-sky-700 dark:text-sky-300",
  Delivered: "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300",
  Cancelled: "bg-red-400/15 text-red-700 dark:text-red-300",
};

export function Orders() {
  const user = useCurrentUser();
  const orders = useStore(ordersStore);
  const returns = useStore(returnsStore);
  const [returning, setReturning] = useState<string | null>(null);
  if (!user) return null;
  const mine = orders.filter((o) => o.userId === user.id);

  return (
    <div>
      <h2 className="font-display text-3xl">Orders</h2>
      {mine.length === 0 ? (
        <p className="mt-6 text-mist">
          You have not placed an order yet. <Link href="/shop" className="text-gold underline-offset-4 hover:underline">Browse the collection</Link>.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {mine.map((o) => {
            const orderReturns = returns.filter((r) => r.orderId === o.id);
            return (
              <li key={o.id} className={`${card} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="font-semibold">Order {o.id}</p>
                    <p className="text-sm text-mist">Placed {formatDate(o.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[o.status]}`}>{o.status}</span>
                </div>
                <div className="border-b border-white/10 py-5"><OrderTimeline status={o.status} /></div>
                <ul className="divide-y divide-white/10">
                  {o.lines.map((l) => (
                    <li key={`${l.slug}-${l.size}`} className="flex items-center gap-4 py-4">
                      <div className="relative aspect-4/5 w-14 shrink-0 overflow-hidden rounded-sm bg-navy-deep">
                        <Image src={l.image} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <Link href={`/shop/${l.slug}`} className="hover:text-gold">{l.name}</Link>
                        <p className="text-sm text-mist">Size {l.size} · Qty {l.qty}{l.preorder ? " · Pre-order" : ""}</p>
                      </div>
                      {l.price !== undefined && <p className="text-gold">{formatPrice(l.price * l.qty)}</p>}
                    </li>
                  ))}
                </ul>
                <div className="mb-4"><OrderExtras order={o} /></div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <p className="text-sm">
                    {o.total !== undefined ? (
                      <>
                        Total <span className="text-lg font-semibold text-gold">{formatPrice(o.total)}</span>
                        {o.voucher && <span className="ml-2 text-mist">(voucher {o.voucher}: −{formatPrice(o.discount)})</span>}
                      </>
                    ) : (
                      <span className="text-mist">Price to be confirmed</span>
                    )}
                    {o.balance ? <span className="mt-1 block text-xs text-mist">Pre-order: {formatPrice(o.paidNow)} paid, {formatPrice(o.balance)} to pay before delivery{o.readyBy ? ` · expected ${o.readyBy}` : ""}</span> : null}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link href={`/order/${o.id}/invoice`} className="text-gold underline-offset-4 hover:underline">Receipt</Link>
                    <a href={whatsappUrl(`Hello Urban Men, I am asking about order ${o.id}.`)} className="text-gold underline-offset-4 hover:underline">Ask about this order</a>
                    {o.status === "Delivered" && (
                      <button type="button" onClick={() => setReturning(returning === o.id ? null : o.id)} className="text-gold underline-offset-4 hover:underline">
                        Request a return or exchange
                      </button>
                    )}
                    {o.status === "Awaiting confirmation" && (
                      <button type="button" onClick={() => setOrderStatus(o.id, "Cancelled")} className="text-mist underline-offset-4 hover:text-red-300 hover:underline">Cancel order</button>
                    )}
                  </div>
                </div>
                {returning === o.id && <ReturnForm order={o} user={user} onDone={() => setReturning(null)} />}
                {orderReturns.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm">
                    {orderReturns.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white/5 px-4 py-2">
                        <span>{r.type} {r.id}: {r.reason}{r.wantedSize ? ` (size ${r.wantedSize})` : ""}</span>
                        <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold">{r.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
