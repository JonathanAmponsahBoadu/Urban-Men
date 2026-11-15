"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { OrderExtras } from "@/components/OrderExtras";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { logActivity, ordersStore, setOrderStatus, useCurrentUser, usersStore } from "@/lib/stores";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { btnOutline, card, input } from "@/lib/ui";

export function OrdersAdmin() {
  const me = useCurrentUser();
  const orders = useStore(ordersStore);
  const users = useStore(usersStore);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [preOnly, setPreOnly] = useState(false);

  const needle = q.trim().toLowerCase();
  const shown = orders.filter((o) => {
    if (status !== "All" && o.status !== status) return false;
    if (preOnly && !o.balance && !o.lines.some((l) => l.preorder)) return false;
    if (!needle) return true;
    const c = users.find((u) => u.id === o.userId);
    return [o.id, o.delivery?.name, o.delivery?.phone, o.delivery?.email, c?.name, c?.email, ...o.lines.map((l) => l.name)].join(" ").toLowerCase().includes(needle);
  });

  const exportCsv = () =>
    downloadCsv("orders.csv", [
      ["order", "date", "customer", "phone", "email", "region", "address", "items", "status", "payment", "total", "paid now", "balance (pre-order)"],
      ...shown.map((o) => {
        const c = users.find((u) => u.id === o.userId);
        return [
          o.id, o.createdAt, o.delivery?.name ?? c?.name, o.delivery?.phone ?? c?.phone, o.delivery?.email ?? c?.email, o.delivery?.region, o.delivery?.address,
          o.lines.map((l) => `${l.qty}x ${l.name} (${l.size})`).join("; "), o.status,
          o.payment ? `${o.payment.method}${o.payment.network ? ` ${o.payment.network}` : ""}${o.payment.demo ? " (demo)" : ""}` : "", o.total, o.paidNow, o.balance,
        ];
      }),
    ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Orders</h2>
        {shown.length > 0 && <button type="button" className={btnOutline} onClick={exportCsv}>Export CSV</button>}
      </div>
      <p className="mt-2 text-mist">Changing the status also sends the customer a message in their inbox.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="ord-q">Search orders</label>
        <input id="ord-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by order, name, phone or item" className={`${input} max-w-sm`} />
        <label className="sr-only" htmlFor="ord-status">Filter by status</label>
        <select id="ord-status" value={status} onChange={(e) => setStatus(e.target.value as "All" | OrderStatus)} className={`${input} w-56`}>
          <option>All</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={preOnly} onChange={(e) => setPreOnly(e.target.checked)} className="h-5 w-5 accent-gold" /> Pre-orders only</label>
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-mist">No orders yet. Orders placed from the cart on this browser will show here.</p>
      ) : shown.length === 0 ? (
        <p className="mt-8 text-mist">No orders match.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {shown.map((o) => {
            const customer = users.find((u) => u.id === o.userId);
            return (
              <li key={o.id} className={`${card} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="font-semibold">{o.id} {o.userId === "guest" && <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-mist">guest</span>}{(o.balance || o.lines.some((l) => l.preorder)) && <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">Pre-order</span>}</p>
                    <p className="text-sm text-mist">{formatDate(o.createdAt)} · {o.delivery?.name ?? customer?.name ?? "Customer"}</p>
                    <p className="text-sm text-mist">
                      {o.delivery?.email ?? customer?.email}
                      {(o.delivery?.phone ?? customer?.phone) && ` · ${o.delivery?.phone ?? customer?.phone}`}
                    </p>
                    <Link href={`/order/${o.id}/invoice`} className="mt-1 inline-block text-sm text-gold underline-offset-4 hover:underline">Receipt</Link>
                  </div>
                  <label className="text-xs uppercase tracking-[0.2em] text-mist">
                    Status
                    <select
                      value={o.status}
                      onChange={(e) => { setOrderStatus(o.id, e.target.value as OrderStatus); logActivity(me?.name ?? "Admin", `set order ${o.id} to ${e.target.value}`); }}
                      className={`${input} mt-1 w-56`}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <ul className="divide-y divide-white/10">
                  {o.lines.map((l) => (
                    <li key={`${l.slug}-${l.size}`} className="flex items-center gap-4 py-3 text-sm">
                      <div className="relative aspect-4/5 w-10 shrink-0 overflow-hidden rounded-sm bg-navy-deep"><Image src={l.image} alt="" fill sizes="40px" className="object-cover" /></div>
                      <span className="flex-1">{l.name} · size {l.size} × {l.qty}{l.preorder ? " · pre-order" : ""}</span>
                      {l.price !== undefined && <span className="text-gold">{formatPrice(l.price * l.qty)}</span>}
                    </li>
                  ))}
                </ul>
                <div className="mb-3"><OrderExtras order={o} showContact /></div>
                <p className="border-t border-white/10 pt-3 text-right text-sm">
                  {o.total !== undefined ? <>Total <span className="text-lg font-semibold text-gold">{formatPrice(o.total)}</span>{o.voucher && ` (voucher ${o.voucher})`}</> : "Price to confirm"}
                </p>
                {o.balance ? <p className="text-right text-sm text-mist">Paid now {formatPrice(o.paidNow)} · balance to collect {formatPrice(o.balance)}{o.readyBy ? ` · expected ${o.readyBy}` : ""}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
