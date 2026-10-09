"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/components/CatalogueProvider";
import { Stars } from "@/components/Stars";
import { site } from "@/data/site";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { reviewsStore } from "@/lib/stores";

/** Real customer reviews only. Hidden until there are some good ones. */
export function ReviewsStrip() {
  const reviews = useStore(reviewsStore);
  const products = useProducts();
  const good = reviews.filter((r) => r.rating >= 4 && r.body.trim().length >= 10).slice(0, 3);
  if (good.length === 0) return null;
  return (
    <section aria-labelledby="says" className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Reviews</p>
        <h2 id="says" className="mt-4 font-display text-4xl md:text-5xl">What customers say</h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {good.map((r) => {
            const p = products.find((x) => x.slug === r.slug);
            return (
              <li key={r.id} className="rounded-sm border border-white/10 bg-navy-soft p-6">
                <Stars value={r.rating} className="text-lg" />
                {r.title && <p className="mt-3 font-display text-xl">{r.title}</p>}
                <p className="mt-2 text-mist">“{r.body}”</p>
                <p className="mt-4 text-sm">
                  {r.userName} · <span className="text-mist">{formatDate(r.createdAt)}</span>
                </p>
                {p && <Link href={`/shop/${p.slug}`} className="mt-1 inline-block text-sm text-gold underline-offset-4 hover:underline">{p.name}</Link>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** A photo strip that links to the brand's Instagram. These are our own product photos, not a live feed. */
export function InstagramStrip() {
  const products = useProducts();
  const photos = products.flatMap((p) => (p.images[0] ? [{ src: p.images[0].src, alt: p.images[0].alt }] : [])).slice(0, 6);
  if (photos.length === 0) return null;
  return (
    <section aria-labelledby="ig" className="pb-20 md:pb-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold">Follow along</p>
            <h2 id="ig" className="mt-4 font-display text-3xl md:text-4xl">@{site.instagramHandle}</h2>
          </div>
          <a href={site.instagramUrl} className="border-b border-gold pb-1 text-sm font-semibold uppercase tracking-widest text-gold">Follow on Instagram</a>
        </div>
        <ul className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6">
          {photos.map((ph, i) => (
            <li key={i}>
              <a href={site.instagramUrl} className="group relative block aspect-square overflow-hidden rounded-sm bg-navy-soft" aria-label="Open our Instagram">
                <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover object-top transition duration-500 group-hover:scale-105" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
