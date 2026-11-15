"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAllProducts } from "@/components/CatalogueProvider";
import { warmBackend } from "@/lib/api";
import { displayName, formatPrice, isPreorder, unitsFor } from "@/lib/format";
import { paymentSplit } from "@/lib/preorder";
import { useSiteSettings } from "@/lib/settings";
import { useHydrated, useStore } from "@/lib/storage";
import {
  cartStore,
  findVoucher,
  removeFromCart,
  setCartQty,
  toggleWishlist,
  wishlistStore,
} from "@/lib/stores";
import { showToast } from "@/lib/toast";
import type { Voucher } from "@/lib/types";
import { btnOutline, btnPrimary, input } from "@/lib/ui";

export function CartView() {
  useEffect(warmBackend, []); // so the shop server is awake by checkout
  const hydrated = useHydrated();
  const cart = useStore(cartStore);
  const wishlist = useStore(wishlistStore);
  const products = useAllProducts();
  const { preorderDepositPercent } = useSiteSettings();

  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState<Voucher | undefined>();
  const [voucherMsg, setVoucherMsg] = useState("");

  if (!hydrated) return <main className="mx-auto max-w-5xl px-5 py-24 text-mist">Loading your cart…</main>;

  const lines = cart.map((item) => ({ item, product: products.find((p) => p.slug === item.slug) }));
  const available = lines.filter((l) => l.product);
  const allPriced = available.length > 0 && available.every((l) => l.product!.price !== undefined);
  const subtotal = allPriced ? available.reduce((s, l) => s + l.product!.price! * l.item.qty, 0) : undefined;
  const discount = subtotal !== undefined && voucher ? Math.round(subtotal * voucher.percentOff) / 100 : 0;
  const total = subtotal !== undefined ? Math.round((subtotal - discount) * 100) / 100 : undefined;
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const split = subtotal !== undefined ? paymentSplit(available.map((l) => ({ price: l.product!.price, qty: l.item.qty, preorder: isPreorder(l.product!) })), preorderDepositPercent, discount) : undefined;

  const applyCode = () => {
    const v = findVoucher(code);
    setVoucher(v);
    setVoucherMsg(v ? `${v.code}: ${v.percentOff}% off applied.` : "That code is not valid.");
  };

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-mist">Find something you love and add it here.</p>
        <Link href="/shop" className={`${btnPrimary} mt-8`}>
          Browse the collection
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
      <h1 className="font-display text-4xl md:text-5xl">
        Your cart <span className="text-2xl text-mist">({count})</span>
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {lines.map(({ item, product }) => {
            const key = `${item.slug}-${item.size}`;
            if (!product) {
              return (
                <li key={key} className="flex items-center justify-between py-6 text-mist">
                  <span>This shirt is no longer available.</span>
                  <button type="button" onClick={() => removeFromCart(item.slug, item.size)} className="text-gold underline-offset-4 hover:underline">
                    Remove
                  </button>
                </li>
              );
            }
            const stock = unitsFor(product, item.size);
            const pre = isPreorder(product);
            const saved = wishlist.includes(item.slug);
            return (
              <li key={key} className="flex gap-4 py-6 sm:gap-6">
                <Link href={`/shop/${product.slug}`} className="relative aspect-4/5 w-24 shrink-0 overflow-hidden rounded-sm bg-navy-soft sm:w-32">
                  <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="128px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/shop/${product.slug}`} className="font-display text-xl hover:text-gold">
                        {displayName(product)}
                      </Link>
                      <p className="mt-1 text-sm text-mist">
                        Size {item.size} · {product.sleeve}
                      </p>
                      <p className="text-xs text-gold">{pre ? "Pre-order · " : ""}{product.includesTrousers === false ? "Shirt only" : "Includes matching trousers"}</p>
                    </div>
                    <p className="text-right text-lg font-semibold text-gold">
                      {product.price !== undefined ? formatPrice(product.price * item.qty) : "Ask for price"}
                    </p>
                  </div>
                  {stock < item.qty && (
                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      {stock <= 0 ? "Out of stock in this size." : `Only ${stock} left in this size.`}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 text-sm">
                    <div className="flex items-center rounded-full border border-white/20">
                      <button type="button" aria-label="Decrease quantity" onClick={() => setCartQty(item.slug, item.size, item.qty - 1)} className="h-9 w-9 text-lg">
                        −
                      </button>
                      <span className="w-8 text-center">{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={item.qty >= stock}
                        onClick={() => setCartQty(item.slug, item.size, item.qty + 1)}
                        className="h-9 w-9 text-lg disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.slug, item.size)} className="text-mist underline-offset-4 hover:text-gold hover:underline">
                      Remove
                    </button>
                    {!saved && (
                      <button
                        type="button"
                        onClick={() => {
                          toggleWishlist(item.slug);
                          removeFromCart(item.slug, item.size);
                          showToast("Moved to wishlist");
                        }}
                        className="text-mist underline-offset-4 hover:text-gold hover:underline"
                      >
                        Move to wishlist
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-sm border border-white/10 bg-navy-soft p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-mist">Items</dt>
              <dd>{count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mist">Subtotal</dt>
              <dd>{subtotal !== undefined ? formatPrice(subtotal) : "Confirmed on WhatsApp"}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                <dt>Voucher {voucher?.code}</dt>
                <dd>− {formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="text-gold">{total !== undefined ? formatPrice(total) : "—"}</dd>
            </div>
            {split?.hasPreorder && (
              <>
                <div className="flex justify-between"><dt className="text-mist">Pay at checkout</dt><dd className="font-semibold">{formatPrice(split.dueNow)}</dd></div>
                <div className="flex justify-between"><dt className="text-mist">Balance before delivery</dt><dd>{formatPrice(split.balance)}</dd></div>
              </>
            )}
          </dl>
          <p className="mt-2 text-xs text-mist">Delivery cost is confirmed with you when we contact you.</p>

          <div className="mt-6">
            <label htmlFor="voucher" className="mb-2 block text-xs uppercase tracking-[0.25em] text-mist">
              Voucher code
            </label>
            <div className="flex gap-2">
              <input id="voucher" value={code} onChange={(e) => setCode(e.target.value)} className={input} placeholder="Enter code" />
              <button type="button" onClick={applyCode} className={btnOutline}>
                Apply
              </button>
            </div>
            {voucherMsg && <p className={`mt-2 text-sm ${voucher ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{voucherMsg}</p>}
          </div>

          <Link
            href={`/checkout${voucher ? `?voucher=${encodeURIComponent(voucher.code)}` : ""}`}
            className={`${btnPrimary} mt-6 w-full`}
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-xs text-mist">
            Pay with Mobile Money at checkout. You will add your delivery details there. Delivery cost is confirmed with you.
          </p>
        </aside>
      </div>
    </main>
  );
}
