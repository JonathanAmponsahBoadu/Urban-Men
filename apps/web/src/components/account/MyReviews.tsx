"use client";

import Link from "next/link";
import { useAllProducts } from "@/components/CatalogueProvider";
import { Stars } from "@/components/Stars";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { deleteReview, ordersStore, reviewsStore, useCurrentUser } from "@/lib/stores";
import { card } from "@/lib/ui";

export function MyReviews() {
  const user = useCurrentUser();
  const reviews = useStore(reviewsStore);
  const orders = useStore(ordersStore);
  const products = useAllProducts();
  if (!user) return null;

  const mine = reviews.filter((r) => r.userId === user.id);
  const reviewed = new Set(mine.map((r) => r.slug));
  const toReview = [
    ...new Set(orders.filter((o) => o.userId === user.id && o.status === "Delivered").flatMap((o) => o.lines.map((l) => l.slug))),
  ].filter((slug) => !reviewed.has(slug));

  return (
    <div>
      <h2 className="font-display text-3xl">Ratings &amp; reviews</h2>

      {toReview.length > 0 && (
        <div className={`${card} mt-6 p-5`}>
          <p className="font-semibold">Waiting for your review</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {toReview.map((slug) => (
              <li key={slug}>
                <Link href={`/shop/${slug}`} className="rounded-full border border-gold/50 px-4 py-1.5 text-sm text-gold hover:bg-gold hover:text-navy">
                  {products.find((p) => p.slug === slug)?.name ?? slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mine.length === 0 ? (
        <p className="mt-6 text-mist">You have not reviewed anything yet. Open a shirt and use the Reviews tab to share what you think.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {mine.map((r) => {
            const p = products.find((x) => x.slug === r.slug);
            return (
              <li key={r.id} className={`${card} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/shop/${r.slug}`} className="font-display text-xl hover:text-gold">{p?.name ?? r.slug}</Link>
                  <span className="text-xs text-mist">{formatDate(r.createdAt)}</span>
                </div>
                <Stars value={r.rating} className="mt-2 text-base" />
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 text-ivory/90">{r.body}</p>
                <button type="button" onClick={() => deleteReview(r.id)} className="mt-3 text-sm text-gold underline-offset-4 hover:underline">Delete review</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
