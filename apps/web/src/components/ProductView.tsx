"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProduct, useProducts } from "@/components/CatalogueProvider";
import { HeartIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { ShareButton, StockAlert } from "@/components/ProductExtras";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductReviews } from "@/components/ProductReviews";
import { ReturnWindow } from "@/components/info/ReturnWindow";
import { SizeChart } from "@/components/SizeChart";
import { Stars } from "@/components/Stars";
import { recommendSize } from "@/data/sizing";
import { whatsappUrl } from "@/data/site";
import { firstAvailableSize, formatPrice, stockLabel, summarizeReviews, totalStock } from "@/lib/format";
import { useHydrated, useStore } from "@/lib/storage";
import { addToCart, cartStore, recentStore, reviewsStore, toggleWishlist, trackRecentlyViewed, useCurrentUser, wishlistStore } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES, type Size } from "@/lib/types";
import { btnOutline, btnPrimary } from "@/lib/ui";

type Tab = "details" | "measurements" | "reviews";

export function ProductView({ slug }: { slug: string }) {
  const hydrated = useHydrated();
  const found = useProduct(slug);
  const currentUser = useCurrentUser();
  // products the admin has hidden are not found for shoppers (admins can still preview them)
  const product = found && (found.published !== false || currentUser?.role === "admin") ? found : undefined;
  const all = useProducts();
  const cart = useStore(cartStore);
  const wishlist = useStore(wishlistStore);
  const reviewList = useStore(reviewsStore);
  const recent = useStore(recentStore);

  const [chosen, setChosen] = useState<Size | undefined>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("details");
  const [barVisible, setBarVisible] = useState(false);
  const cta = useRef<HTMLDivElement>(null);

  // remember this product as recently viewed
  useEffect(() => {
    if (product) trackRecentlyViewed(slug);
  }, [slug, product]);

  // show the sticky add-to-cart bar on phones once the main button scrolls out of view
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [product]);

  if (!product) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-32 text-center md:px-10">
        {hydrated ? (
          <>
            <h1 className="font-display text-4xl">We could not find that shirt.</h1>
            <p className="mt-3 text-mist">It may have been removed.</p>
            <Link href="/shop" className={`${btnPrimary} mt-8`}>Back to the shop</Link>
          </>
        ) : (
          <p className="text-mist">Loading…</p>
        )}
      </main>
    );
  }

  const withTrousers = product.includesTrousers !== false;
  const size = chosen ?? firstAvailableSize(product);
  const units = size ? product.stock[size] : 0;
  const inCart = size ? (cart.find((i) => i.slug === slug && i.size === size)?.qty ?? 0) : 0;
  const room = Math.max(0, units - inCart);
  const stock = stockLabel(size ? units : 0);
  const price = formatPrice(product.price);
  const oldPrice = product.compareAtPrice && product.price !== undefined && product.compareAtPrice > product.price ? product.compareAtPrice : undefined;
  const off = oldPrice && product.price !== undefined ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : 0;
  const liked = hydrated && wishlist.includes(slug);
  const { count, average } = summarizeReviews(reviewList.filter((r) => r.slug === slug));
  const soldOut = totalStock(product) <= 0;
  const n = Math.min(qty, Math.max(room, 1));
  const recommended = recommendSize(currentUser?.measurements?.chest);

  const related = [...all.filter((p) => p.slug !== slug)]
    .sort((a, b) => Number(b.sleeve === product.sleeve) - Number(a.sleeve === product.sleeve))
    .slice(0, 3);
  const recentProducts = recent.filter((s) => s !== slug).flatMap((s) => all.find((p) => p.slug === s) ?? []).slice(0, 4);

  const add = () => {
    if (!size || room < 1) return;
    addToCart(slug, size, n);
    showToast(`${n} × ${product.name} (${size}) added to cart`, { href: "/cart", label: "View cart" });
  };

  const goTab = (t: Tab) => {
    setTab(t);
    document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth" });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "measurements", label: "Measurements" },
    { id: "reviews", label: `Reviews (${count})` },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 pb-32 pt-8 md:px-10 md:pb-24 md:pt-12">
      <nav aria-label="Breadcrumb" className="text-sm text-mist">
        <Link href="/shop" className="hover:text-gold">Shop</Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="text-ivory">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ProductGallery key={slug} images={product.images} name={product.name} />
          <p className="mt-3 text-center text-xs text-mist">Swipe or use the arrows to see the model and the shirt on its own. Tap a photo to zoom.</p>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.sleeve} · {product.colour}</p>
            <ShareButton title={product.name} />
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
          {product.badge && <span className="mt-3 inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy">{product.badge}</span>}

          <button type="button" onClick={() => goTab("reviews")} className="mt-4 flex items-center gap-3 text-sm text-mist hover:text-gold">
            {count > 0 ? (<><Stars value={average} className="text-lg" /><span>{average.toFixed(1)} · {count} review{count > 1 ? "s" : ""}</span></>) : <span>No ratings yet · be the first to review</span>}
          </button>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            {price ? <p className="text-4xl font-semibold text-gold">{price}</p> : <p className="text-lg text-mist">Ask us for the price on WhatsApp</p>}
            {oldPrice && (
              <>
                <p className="text-xl text-mist line-through">{formatPrice(oldPrice)}</p>
                <span className="rounded-full bg-red-400/15 px-2.5 py-1 text-xs font-bold text-red-200">−{off}%</span>
              </>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock.tone === "ok" ? "bg-emerald-400/15 text-emerald-300" : stock.tone === "low" ? "bg-amber-400/15 text-amber-300" : "bg-red-400/15 text-red-300"}`}>
              {stock.text}
            </span>
          </div>

          <p className="mt-5 text-lg leading-relaxed text-mist">{product.note}.</p>

          <p className={`mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${withTrousers ? "border-gold/40 bg-gold/5" : "border-white/15"}`}>
            <span aria-hidden className="text-gold">{withTrousers ? "✓" : "i"}</span>
            {withTrousers ? (
              <span><span className="font-semibold">Comes with matching trousers</span>, cut from the same cloth. We confirm your trouser size with you when we confirm your order.</span>
            ) : (
              <span><span className="font-semibold">Shirt only.</span> Trousers are not included with this one.</span>
            )}
          </p>

          <fieldset className="mt-8">
            <legend className="mb-3 flex w-full items-center justify-between text-xs uppercase tracking-[0.25em] text-mist">
              <span>Size {size && <span className="text-gold">· {size}</span>}</span>
              <button type="button" onClick={() => goTab("measurements")} className="normal-case tracking-normal text-gold underline-offset-4 hover:underline">Size guide</button>
            </legend>
            <div className="flex flex-wrap gap-3">
              {SIZES.map((s) => {
                const out = (product.stock[s] ?? 0) <= 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setChosen(s); setQty(1); }}
                    aria-pressed={size === s}
                    aria-label={`Size ${s}${out ? ", sold out" : ""}`}
                    className={`relative h-12 min-w-14 rounded-md border px-4 text-sm font-semibold transition-colors ${size === s ? "border-gold bg-gold text-navy" : "border-white/20 hover:border-gold"} ${out ? "opacity-40 line-through" : ""}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {recommended && <p className="mt-3 text-sm text-gold">Based on your saved measurements, we suggest size {recommended}.</p>}
            {size && units > 0 && units <= 3 && <p className="mt-3 text-sm text-amber-300">Hurry, only {units} left in size {size}.</p>}
          </fieldset>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-xs uppercase tracking-[0.25em] text-mist">Quantity</span>
            <div className="flex items-center rounded-full border border-white/20">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity" className="h-10 w-10 text-lg disabled:opacity-30">−</button>
              <span className="w-8 text-center" aria-live="polite">{n}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(Math.max(room, 1), q + 1))} disabled={qty >= room} aria-label="Increase quantity" className="h-10 w-10 text-lg disabled:opacity-30">+</button>
            </div>
            {inCart > 0 && <span className="text-sm text-mist">{inCart} already in your cart</span>}
          </div>

          <div ref={cta} className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button type="button" onClick={add} disabled={soldOut || !size || room < 1} className={btnPrimary}>
              {soldOut ? "Sold out" : room < 1 ? (units < 1 ? "Sold out in this size" : "Max in cart") : "Add to cart"}
            </button>
            <button
              type="button"
              aria-pressed={liked}
              aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
              onClick={() => { toggleWishlist(slug); showToast(liked ? "Removed from wishlist" : "Saved to your wishlist", { href: "/account/wishlist", label: "View" }); }}
              className={`flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold uppercase tracking-widest transition-colors ${liked ? "border-gold bg-gold text-navy" : "border-gold/60 text-gold hover:bg-gold hover:text-navy"}`}
            >
              <HeartIcon className="h-5 w-5" filled={liked} /> {liked ? "Saved" : "Wishlist"}
            </button>
          </div>
          <a href={whatsappUrl(`Hello Urban Men, I would like to order ${product.name}${size ? `, size ${size}` : ""}, quantity ${n}${withTrousers ? ", with the matching trousers" : ""}.`)} className={`${btnOutline} mt-3 w-full`}>
            Order on WhatsApp
          </a>

          {(soldOut || (size && units < 1)) && <StockAlert slug={slug} size={size} userId={currentUser?.id} />}

          <ul className="mt-8 divide-y divide-white/10 rounded-md border border-white/10 text-sm">
            <li className="flex gap-3 px-4 py-3"><span className="text-gold" aria-hidden>🚚</span><span><span className="font-semibold">Delivery:</span> cost and time confirmed with you for your location.</span></li>
            <li className="flex gap-3 px-4 py-3"><span className="text-gold" aria-hidden>↩</span><span><span className="font-semibold">Returns:</span> ask within <ReturnWindow /> of receiving it. <Link href="/delivery-returns" className="text-gold underline-offset-4 hover:underline">Details</Link></span></li>
            <li className="flex gap-3 px-4 py-3"><span className="text-gold" aria-hidden>✂</span><span><span className="font-semibold">Different fit or colour?</span> <Link href="/custom-style" className="text-gold underline-offset-4 hover:underline">Request a custom style</Link>.</span></li>
          </ul>
        </div>
      </div>

      <section id="product-tabs" className="mt-20 scroll-mt-28">
        <div role="tablist" aria-label="Product information" className="flex gap-2 overflow-x-auto border-b border-white/10">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold uppercase tracking-widest transition-colors ${tab === t.id ? "border-gold text-gold" : "border-transparent text-mist hover:text-ivory"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-10">
          {tab === "details" && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl">About this shirt</h2>
                <p className="mt-4 text-lg leading-relaxed text-mist">{product.description}</p>
              </div>
              <div>
                <h2 className="font-display text-2xl">Features</h2>
                <ul className="mt-4 space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 text-ivory/90"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-gold" />{f}</li>
                  ))}
                  {!withTrousers && <li className="flex gap-3 text-ivory/90"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-gold" />Shirt only, trousers not included</li>}
                </ul>
                <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-xs uppercase tracking-[0.25em] text-mist">Sleeve</dt><dd className="mt-1">{product.sleeve}</dd></div>
                  <div><dt className="text-xs uppercase tracking-[0.25em] text-mist">Base colour</dt><dd className="mt-1">{product.colour}</dd></div>
                  <div><dt className="text-xs uppercase tracking-[0.25em] text-mist">Matching trousers</dt><dd className="mt-1">{withTrousers ? "Included" : "Not included"}</dd></div>
                </dl>
              </div>
            </div>
          )}

          {tab === "measurements" && (
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 className="mb-4 font-display text-2xl">Size chart</h2>
                <SizeChart highlight={size} />
              </div>
              <div>
                <h2 className="mb-4 font-display text-2xl">Between sizes?</h2>
                <p className="text-mist">Measure a shirt that fits you well and compare it to the chart, or save your measurements in your account and we will suggest a size.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/size-guide" className={btnOutline}>Find my size</Link>
                  <Link href="/custom-style" className={btnOutline}>Custom fit</Link>
                </div>
              </div>
            </div>
          )}

          {tab === "reviews" && <ProductReviews slug={slug} />}
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-24 border-t border-white/10 pt-14">
          <h2 id="related" className="font-display text-3xl md:text-4xl">You may also like</h2>
          <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section aria-labelledby="recent" className="mt-24 border-t border-white/10 pt-14">
          <h2 id="recent" className="font-display text-3xl md:text-4xl">Recently viewed</h2>
          <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {recentProducts.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}

      {/* sticky add-to-cart bar for phones */}
      <div className={`fixed inset-x-0 bottom-[3.6rem] z-57 border-t border-white/10 bg-navy-deep/95 px-4 py-3 backdrop-blur transition-transform md:hidden ${barVisible && !soldOut ? "translate-y-0" : "translate-y-[200%]"}`} aria-hidden={!barVisible}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="text-sm text-gold">{price}{size ? ` · size ${size}` : ""}</p>
          </div>
          <button type="button" onClick={add} tabIndex={barVisible ? 0 : -1} disabled={!size || room < 1} className={`${btnPrimary} shrink-0 px-6 py-2.5`}>
            Add to cart
          </button>
        </div>
      </div>
    </main>
  );
}
