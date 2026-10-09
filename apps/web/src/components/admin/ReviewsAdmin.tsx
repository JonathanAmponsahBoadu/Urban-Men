"use client";

import Link from "next/link";
import { useAllProducts } from "@/components/CatalogueProvider";
import { Stars } from "@/components/Stars";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { deleteReview, logActivity, reviewsStore, useCurrentUser } from "@/lib/stores";
import { card } from "@/lib/ui";

export function ReviewsAdmin() {
  const me = useCurrentUser();
  const reviews = useStore(reviewsStore);
  const products = useAllProducts();
  return (
    <div>
      <h2 className="font-display text-3xl">Reviews</h2>
      <p className="mt-2 text-mist">Remove anything abusive, misleading or unrelated to the product.</p>
      {reviews.length === 0 ? (
        <p className="mt-8 text-mist">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => {
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
                <div className="mt-3 flex items-center gap-4 text-sm text-mist">
                  <span>by {r.userName}</span>
                  <button type="button" onClick={() => { if (window.confirm("Delete this review?")) { deleteReview(r.id); logActivity(me?.name ?? "Admin", `deleted a review of ${p?.name ?? r.slug}`); } }} className="text-gold underline-offset-4 hover:underline">Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
