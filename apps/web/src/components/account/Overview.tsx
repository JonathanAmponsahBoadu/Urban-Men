"use client";

import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { cartStore, inboxStore, ordersStore, requestsStore, useCurrentUser, wishlistStore } from "@/lib/stores";
import { card } from "@/lib/ui";

export function Overview() {
  const user = useCurrentUser();
  const orders = useStore(ordersStore);
  const inbox = useStore(inboxStore);
  const wishlist = useStore(wishlistStore);
  const cart = useStore(cartStore);
  const requests = useStore(requestsStore);
  if (!user) return null;

  const mine = orders.filter((o) => o.userId === user.id);
  const unread = inbox.filter((m) => m.userId === user.id && !m.read).length;
  const myRequests = requests.filter((r) => r.userId === user.id);
  const latest = mine[0];

  const tiles = [
    { href: "/account/orders", label: "Orders", value: mine.length },
    { href: "/account/inbox", label: "Unread messages", value: unread },
    { href: "/account/wishlist", label: "Wishlist", value: wishlist.length },
    { href: "/cart", label: "In your cart", value: cart.reduce((n, i) => n + i.qty, 0) },
    { href: "/account/requests", label: "Style requests", value: myRequests.length },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={`${card} p-5 transition-colors hover:border-gold/50`}>
            <p className="font-display text-4xl text-gold">{t.value}</p>
            <p className="mt-1 text-sm text-mist">{t.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl">Latest order</h2>
      {latest ? (
        <Link href="/account/orders" className={`${card} mt-4 block p-5 hover:border-gold/50`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{latest.id}</p>
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold">{latest.status}</span>
          </div>
          <p className="mt-1 text-sm text-mist">
            {formatDate(latest.createdAt)} · {latest.lines.reduce((n, l) => n + l.qty, 0)} item(s)
            {latest.total !== undefined && ` · ${formatPrice(latest.total)}`}
          </p>
        </Link>
      ) : (
        <p className="mt-4 text-mist">
          No orders yet. <Link href="/shop" className="text-gold underline-offset-4 hover:underline">Start shopping</Link>.
        </p>
      )}

      <div className={`${card} mt-12 flex flex-wrap items-center justify-between gap-4 p-6`}>
        <div>
          <h2 className="font-display text-2xl">Want something made just for you?</h2>
          <p className="mt-1 text-mist">Describe a style or share a photo and we will tell you what is possible.</p>
        </div>
        <Link href="/custom-style" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-navy hover:bg-gold-deep">
          Request a style
        </Link>
      </div>
    </div>
  );
}
