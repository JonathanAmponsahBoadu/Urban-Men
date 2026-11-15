"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { Stars } from "@/components/Stars";
import type { Product } from "@/data/products";
import { displayName, firstAvailableSize, formatPrice, isPreorder, stockLabel, summarizeReviews, unitsFor } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { addToCart, cartStore, reviewsStore } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES, type Size } from "@/lib/types";
import { btnOutline, btnPrimary } from "@/lib/ui";

/** Pop-up to choose a size and add to cart straight from the product grid. */
export function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const cart = useStore(cartStore);
  const reviews = useStore(reviewsStore);
  const [chosen, setChosen] = useState<Size | undefined>();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const size = chosen ?? firstAvailableSize(product);
  const room = size ? unitsFor(product, size) - (cart.find((i) => i.slug === product.slug && i.size === size)?.qty ?? 0) : 0;
  const stock = stockLabel(size ? unitsFor(product, size) : 0, isPreorder(product));
  const name = displayName(product);
  const { count, average } = summarizeReviews(reviews.filter((r) => r.slug === product.slug));
  const price = formatPrice(product.price);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Quick view: ${name}`} className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="no-scrollbar grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-white/15 bg-navy-deep shadow-2xl sm:grid-cols-2" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-4/5 bg-navy-soft sm:aspect-auto sm:min-h-[26rem]">
          <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="(min-width: 640px) 24rem, 95vw" className="object-cover" />
        </div>
        <div className="relative p-6">
          <button type="button" onClick={onClose} aria-label="Close quick view" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10">
            <CloseIcon className="h-5 w-5" />
          </button>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.sleeve} · {product.colour}</p>
          <h2 className="mt-2 pr-8 font-display text-3xl leading-tight">{name}</h2>
          {product.localName && <p className="mt-1 text-sm text-mist">{product.name}{product.localMeaning ? ` · “${product.localMeaning}”` : ""}</p>}
          <div className="mt-2 flex items-center gap-2 text-sm text-mist">
            {count > 0 ? (<><Stars value={average} className="text-base" /><span>({count})</span></>) : <span>No ratings yet</span>}
          </div>
          <p className="mt-4 text-3xl font-semibold text-gold">{price ?? "Ask for price"}</p>
          <p className={`mt-1 text-sm ${stock.tone === "ok" ? "text-emerald-700 dark:text-emerald-300" : stock.tone === "low" ? "text-amber-700 dark:text-amber-300" : "text-red-700 dark:text-red-300"}`}>{stock.text}</p>
          <p className="mt-4 text-mist">{product.note}.</p>

          <fieldset className="mt-5">
            <legend className="mb-2 text-xs uppercase tracking-[0.25em] text-mist">Size</legend>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const out = unitsFor(product, s) <= 0;
                return (
                  <button key={s} type="button" disabled={out} onClick={() => setChosen(s)} aria-pressed={size === s} aria-label={`Size ${s}${out ? ", sold out" : ""}`}
                    className={`h-10 min-w-12 rounded-md border px-3 text-sm font-semibold ${size === s ? "border-gold bg-gold text-navy" : "border-white/20 hover:border-gold"} disabled:opacity-35 disabled:line-through`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              disabled={!size || room < 1}
              onClick={() => {
                if (!size) return;
                addToCart(product.slug, size, 1);
                showToast(`${name} (${size}) added to cart`, { href: "/cart", label: "View cart" });
                onClose();
              }}
              className={btnPrimary}
            >
              {room < 1 ? "Unavailable" : isPreorder(product) ? "Pre-order now" : "Add to cart"}
            </button>
            <Link href={`/shop/${product.slug}`} onClick={onClose} className={btnOutline}>View full details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
