"use client";

import Link from "next/link";
import { useAllProducts } from "@/components/CatalogueProvider";
import { BarList, ColumnChart, type Point } from "@/components/admin/charts";
import { formatDate, formatPrice, summarizeReviews, totalStock } from "@/lib/format";
import { useStore } from "@/lib/storage";
import {
  activityStore,
  contactMessagesStore,
  notifyStore,
  ordersStore,
  requestsStore,
  returnsStore,
  reviewsStore,
  subscribersStore,
  usersStore,
} from "@/lib/stores";
import { ORDER_STATUSES, SIZES } from "@/lib/types";
import { btnPrimary, card } from "@/lib/ui";

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function Dashboard() {
  const products = useAllProducts();
  const everything = products;
  const orders = useStore(ordersStore);
  const requests = useStore(requestsStore);
  const reviews = useStore(reviewsStore);
  const users = useStore(usersStore);
  const messages = useStore(contactMessagesStore);
  const returns = useStore(returnsStore);
  const alerts = useStore(notifyStore);
  const subscribers = useStore(subscribersStore);
  const activity = useStore(activityStore);

  const published = products.filter((p) => p.published !== false).length;
  const units = everything.reduce((n, p) => n + totalStock(p), 0);
  const low = everything.flatMap((p) => SIZES.filter((s) => p.stock[s] <= 3).map((s) => ({ p, s, n: p.stock[s] })));
  const live = orders.filter((o) => o.status !== "Cancelled");
  const revenue = live.reduce((s, o) => s + (o.total ?? 0), 0);
  const { count, average } = summarizeReviews(reviews);

  // order value for each of the last 14 days
  const today = new Date();
  const days: Point[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    const sameDay = live.filter((o) => dayKey(new Date(o.createdAt)) === dayKey(d));
    return {
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: Math.round(sameDay.reduce((s, o) => s + (o.total ?? 0), 0) * 100) / 100,
      detail: `${sameDay.length} order${sameDay.length === 1 ? "" : "s"}`,
    };
  });
  const byStatus = ORDER_STATUSES.map((s) => ({ label: s, value: orders.filter((o) => o.status === s).length }));

  const tiles = [
    { label: "Shirts live", value: `${published}/${products.length}`, href: "/admin/products" },
    { label: "Units in stock", value: String(units), href: "/admin/products" },
    { label: "Orders to confirm", value: String(orders.filter((o) => o.status === "Awaiting confirmation").length), href: "/admin/orders" },
    { label: "New style requests", value: String(requests.filter((r) => r.status === "New").length), href: "/admin/requests" },
    { label: "Unread messages", value: String(messages.filter((m) => !m.handled).length), href: "/admin/inbox" },
    { label: "Returns to review", value: String(returns.filter((r) => r.status === "New").length), href: "/admin/inbox" },
    { label: "Back-in-stock requests", value: String(alerts.length), href: "/admin/inbox" },
    { label: "Newsletter sign-ups", value: String(subscribers.length), href: "/admin/inbox" },
    { label: "Average rating", value: count ? `${average.toFixed(1)} (${count})` : "–", href: "/admin/reviews" },
    { label: "Customers", value: String(users.filter((u) => u.role === "shopper").length), href: "/admin/customers" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Dashboard</h2>
        <Link href="/admin/products/new" className={btnPrimary}>Add a new style</Link>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-mist">Order value (this browser)</p>
      <p className="text-5xl font-semibold text-gold">{formatPrice(revenue) ?? "GH₵ 0.00"}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`${card} p-4 transition-colors hover:border-gold/50`}>
            <p className="text-2xl font-semibold text-gold">{t.value}</p>
            <p className="mt-1 text-xs text-mist">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <section className={`${card} p-5`} aria-labelledby="chart-days">
          <h3 id="chart-days" className="font-display text-xl">Order value, last 14 days</h3>
          <p className="mb-3 text-sm text-mist">GH₵ per day, cancelled orders left out.</p>
          <ColumnChart title="Order value per day for the last 14 days" points={days} money />
        </section>
        <section className={`${card} p-5`} aria-labelledby="chart-status">
          <h3 id="chart-status" className="font-display text-xl">Orders by status</h3>
          <p className="mb-5 text-sm text-mist">{orders.length} order{orders.length === 1 ? "" : "s"} in total.</p>
          <BarList rows={byStatus} />
        </section>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <div className={`${card} p-5`}>
          <h3 className="font-display text-xl">Running low</h3>
          {low.length === 0 ? (
            <p className="mt-3 text-sm text-mist">Nothing is running low.</p>
          ) : (
            <ul className="mt-3 max-h-64 divide-y divide-white/10 overflow-y-auto text-sm">
              {low.map(({ p, s, n }) => (
                <li key={`${p.slug}-${s}`} className="flex items-center justify-between py-2">
                  <Link href={`/admin/products/${p.slug}`} className="hover:text-gold">{p.name} · {s}</Link>
                  <span className={n === 0 ? "text-red-300" : "text-amber-300"}>{n === 0 ? "Out" : `${n} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`${card} p-5`}>
          <h3 className="font-display text-xl">Recent orders</h3>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-mist">No orders yet in this browser.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 text-sm">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    {o.id} · {o.delivery?.name ?? users.find((u) => u.id === o.userId)?.name ?? "Customer"}
                    <span className="block text-xs text-mist">{formatDate(o.createdAt)}</span>
                  </span>
                  <span className="text-right text-gold">{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={`${card} mt-8 p-5`}>
        <h3 className="font-display text-xl">Recent activity</h3>
        {activity.length === 0 ? (
          <p className="mt-3 text-sm text-mist">Changes made by staff will be listed here.</p>
        ) : (
          <ul className="mt-3 max-h-72 divide-y divide-white/10 overflow-y-auto text-sm">
            {activity.slice(0, 20).map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <span><span className="font-semibold">{a.who}</span> {a.action}</span>
                <span className="text-xs text-mist">{formatDate(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
