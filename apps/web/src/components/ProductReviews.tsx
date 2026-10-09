"use client";

import Link from "next/link";
import { useState } from "react";
import { StarInput, Stars } from "@/components/Stars";
import { formatDate, summarizeReviews } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { addReview, deleteReview, reviewsStore, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { btnPrimary, input, label } from "@/lib/ui";

export function ProductReviews({ slug }: { slug: string }) {
  const user = useCurrentUser();
  const all = useStore(reviewsStore);
  const reviews = all.filter((r) => r.slug === slug);
  const { count, average, distribution } = summarizeReviews(reviews);
  const mine = user ? reviews.find((r) => r.userId === user.id) : undefined;

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating < 1) return setError("Please choose a star rating.");
    if (body.trim().length < 5) return setError("Please write a few words about the shirt.");
    addReview(user, slug, rating, body, title);
    setRating(0);
    setTitle("");
    setBody("");
    setError("");
    showToast("Thanks, your review is posted");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
      <div>
        <p className="font-display text-5xl">{count ? average.toFixed(1) : "–"}</p>
        <Stars value={average} className="mt-2 text-xl" />
        <p className="mt-2 text-sm text-mist">{count ? `${count} review${count > 1 ? "s" : ""}` : "No reviews yet"}</p>
        <ul className="mt-5 space-y-2" aria-label="Rating breakdown">
          {distribution.map((d) => (
            <li key={d.stars} className="flex items-center gap-3 text-sm text-mist">
              <span className="w-6">{d.stars}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full bg-gold" style={{ width: count ? `${(d.count / count) * 100}%` : "0%" }} />
              </span>
              <span className="w-6 text-right">{d.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {!user ? (
          <p className="rounded-sm border border-white/10 p-5 text-mist">
            <Link href={`/login?next=/shop/${slug}`} className="font-semibold text-gold underline-offset-4 hover:underline">Sign in</Link> to rate this shirt and leave a review.
          </p>
        ) : mine ? (
          <p className="rounded-sm border border-white/10 p-5 text-mist">You have reviewed this shirt. Thank you!</p>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-sm border border-white/10 bg-navy-soft p-5">
            <p className="font-display text-xl">Rate this shirt</p>
            <StarInput value={rating} onChange={setRating} />
            <div>
              <label htmlFor="rv-title" className={label}>Headline (optional)</label>
              <input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={input} />
            </div>
            <div>
              <label htmlFor="rv-body" className={label}>Your review</label>
              <textarea id="rv-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={1000} className={input} placeholder="How is the fit, fabric and finish?" />
            </div>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <button type="submit" className={btnPrimary}>Post review</button>
          </form>
        )}

        <ul className="mt-8 space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-white/10 pb-6">
              <div className="flex items-center justify-between gap-4">
                <Stars value={r.rating} className="text-base" />
                <span className="text-xs text-mist">{formatDate(r.createdAt)}</span>
              </div>
              {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
              <p className="mt-1 text-ivory/90">{r.body}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-mist">
                <span>by {r.userName}</span>
                {user && (user.id === r.userId || user.role === "admin") && (
                  <button type="button" onClick={() => deleteReview(r.id)} className="text-gold underline-offset-4 hover:underline">Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
