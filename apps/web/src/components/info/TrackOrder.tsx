"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderTimeline } from "@/components/OrderTimeline";
import { whatsappUrl } from "@/data/site";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { ordersStore, usersStore } from "@/lib/stores";
import type { Order } from "@/lib/types";
import { btnPrimary, input, label } from "@/lib/ui";

const digits = (v: string) => v.replace(/\D/g, "").slice(-9);

export function TrackOrder() {
  const orders = useStore(ordersStore);
  const users = useStore(usersStore);
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Order | null | undefined>(undefined);

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
    const owner = order ? users.find((u) => u.id === order.userId) : undefined;
    const phones = [order?.delivery?.phone, owner?.phone, order?.payment?.phone].filter(Boolean).map((p) => digits(p!));
    setResult(order && digits(phone).length >= 9 && phones.includes(digits(phone)) ? order : null);
  };

  return (
    <div>
      <form onSubmit={find} className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="tr-id" className={label}>Order number</label>
          <input id="tr-id" value={id} onChange={(e) => setId(e.target.value)} placeholder="UM-ABC123" className={input} />
        </div>
        <div>
          <label htmlFor="tr-phone" className={label}>Phone number on the order</label>
          <input id="tr-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 000 0000" className={input} />
        </div>
        <button type="submit" className={btnPrimary}>Track</button>
      </form>

      {result === null && (
        <p role="alert" className="mt-6 rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-200">
          We could not find an order with those details. Check the order number and phone number, or <a href={whatsappUrl("Hello Urban Men, I need help finding my order.")} className="underline">message us on WhatsApp</a>.
        </p>
      )}

      {result && (
        <section aria-live="polite" className="mt-8 rounded-sm border border-white/10 bg-navy-soft p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-2xl">Order {result.id}</p>
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">{result.status}</span>
          </div>
          <p className="mt-1 text-sm text-mist">Placed {formatDate(result.createdAt)}</p>
          <div className="mt-6"><OrderTimeline status={result.status} /></div>
          <ul className="mt-6 divide-y divide-white/10 border-t border-white/10 text-sm">
            {result.lines.map((l) => (
              <li key={`${l.slug}-${l.size}`} className="flex justify-between gap-4 py-3">
                <span>{l.name} · size {l.size} × {l.qty}</span>
                {l.price !== undefined && <span className="text-gold">{formatPrice(l.price * l.qty)}</span>}
              </li>
            ))}
          </ul>
          {result.total !== undefined && <p className="border-t border-white/10 pt-3 text-right">Total <span className="font-semibold text-gold">{formatPrice(result.total)}</span></p>}
          <p className="mt-4 text-sm text-mist">
            Questions? <a href={whatsappUrl(`Hello Urban Men, I am asking about order ${result.id}.`)} className="text-gold underline-offset-4 hover:underline">Ask on WhatsApp</a> or <Link href="/contact" className="text-gold underline-offset-4 hover:underline">contact us</Link>.
          </p>
        </section>
      )}
    </div>
  );
}
