"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BagIcon, HeartIcon } from "@/components/icons";
import { QuickView } from "@/components/QuickView";
import { Stars } from "@/components/Stars";
import type { Product } from "@/data/products";
import { whatsappUrl } from "@/data/site";
import { formatPrice, summarizeReviews, totalStock } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/storage";
import { addToCart, cartStore, reviewsStore, toggleWishlist, wishlistStore } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES, type Size } from "@/lib/types";

const sizes = "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw";
const iconBtn = "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition-colors";

export function ProductCard({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const wishlist = useStore(wishlistStore);
  const reviews = useStore(reviewsStore);
  const cart = useStore(cartStore);
  const [picker, setPicker] = useState(false);
  const [quick, setQuick] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  // close the size picker on outside click / Escape
  useEffect(() => {
    if (!picker) return;
    const onDown = (e: MouseEvent) => {
      if (frame.current && !frame.current.contains(e.target as Node)) setPicker(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPicker(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [picker]);

  const [main, second] = product.images;
  // Only swap to a second *photo* on hover (e.g. back view), never to a flat shot.
  const hover = second?.kind === "photo" ? second : undefined;
  const price = formatPrice(product.price);
  const liked = hydrated && wishlist.includes(product.slug);
  const { count, average } = summarizeReviews(reviews.filter((r) => r.slug === product.slug));
  const soldOut = totalStock(product) <= 0;
  const order = whatsappUrl(`Hello Urban Men, I am interested in ${product.name}.`);

  const roomFor = (s: Size) =>
    (product.stock[s] ?? 0) - (cart.find((i) => i.slug === product.slug && i.size === s)?.qty ?? 0);

  const quickAdd = (s: Size) => {
    if (roomFor(s) < 1) return;
    addToCart(product.slug, s, 1);
    setPicker(false);
    showToast(`${product.name} (${s}) added to cart`, { href: "/cart", label: "View cart" });
  };

  return (
    <article className="group">
      <div className="relative" ref={frame}>
        <Link href={`/shop/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
          <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-navy-soft">
            <Image
              src={main.src}
              alt={main.alt}
              fill
              sizes={sizes}
              className={`object-cover transition duration-700 ${hover ? "group-hover:opacity-0" : "group-hover:scale-105"} ${soldOut ? "opacity-60" : ""}`}
            />
            {hover && (
              <Image src={hover.src} alt="" fill sizes={sizes} className="object-cover opacity-0 transition duration-700 group-hover:opacity-100" />
            )}
            {product.sleeve && (
              <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-[0.65rem] uppercase tracking-widest text-gold backdrop-blur">
                {product.sleeve}
              </span>
            )}
            {soldOut && (
              <span className="absolute bottom-3 left-3 rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-navy">Sold out</span>
            )}
            {!soldOut && product.badge && (
              <span className="absolute bottom-3 left-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">{product.badge}</span>
            )}
          </div>
        </Link>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              toggleWishlist(product.slug);
              showToast(liked ? "Removed from wishlist" : "Saved to your wishlist", { href: "/account/wishlist", label: "View" });
            }}
            aria-pressed={liked}
            aria-label={liked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`${iconBtn} ${liked ? "bg-gold text-navy" : "bg-navy/70 text-ivory hover:bg-navy"}`}
          >
            <HeartIcon className="h-5 w-5" filled={liked} />
          </button>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => setPicker((v) => !v)}
            aria-expanded={picker}
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`}
            className={`${iconBtn} ${picker ? "bg-gold text-navy" : "bg-navy/70 text-ivory hover:bg-navy"} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <BagIcon className="h-5 w-5" />
          </button>
        </div>

        {!picker && !soldOut && (
          <button
            type="button"
            onClick={() => setQuick(true)}
            className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full bg-navy/90 px-5 py-2 text-xs font-semibold uppercase tracking-widest opacity-0 backdrop-blur transition-opacity hover:bg-gold hover:text-navy focus-visible:opacity-100 group-hover:opacity-100 md:block"
          >
            Quick view
          </button>
        )}

        {picker && (
          <div role="group" aria-label={`Choose a size for ${product.name}`} className="absolute inset-x-2 bottom-2 rounded-md border border-gold/40 bg-navy/95 p-3 shadow-xl backdrop-blur">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-mist">Choose a size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const out = roomFor(s) < 1;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={out}
                    onClick={() => quickAdd(s)}
                    aria-label={`Size ${s}${out ? ", unavailable" : ""}`}
                    className={`h-9 min-w-11 rounded-md border px-3 text-sm font-semibold transition-colors ${
                      out ? "cursor-not-allowed border-white/10 text-white/30 line-through" : "border-white/25 hover:border-gold hover:bg-gold hover:text-navy"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Link href={`/shop/${product.slug}`} className="mt-4 block">
        <h3 className="font-display text-xl leading-snug group-hover:text-gold">{product.name}</h3>
      </Link>
      <p className="mt-1 text-sm text-mist">{product.note}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          {price ? (
            <p className="flex items-baseline gap-2 text-xl font-semibold text-gold">
              {price}
              {product.compareAtPrice && product.price !== undefined && product.compareAtPrice > product.price && (
                <span className="text-sm font-normal text-mist line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </p>
          ) : (
            <p className="text-sm text-mist">Ask for price</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-mist">
            {count > 0 ? (
              <>
                <Stars value={average} className="text-sm" />
                <span>({count})</span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>
        </div>
        <a href={order} aria-label={`Order ${product.name} on WhatsApp`} className="shrink-0 text-sm font-semibold text-gold underline-offset-4 hover:underline">
          Order&nbsp;↗
        </a>
      </div>
      {quick && <QuickView product={product} onClose={() => setQuick(false)} />}
    </article>
  );
}
