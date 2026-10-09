"use client";

import Link from "next/link";
import { useProducts } from "@/components/CatalogueProvider";
import { ShopIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import { btnOutline } from "@/lib/ui";

const SHOWN = 6;

export function Collection() {
  const products = useProducts();
  const shown = products.slice(0, SHOWN);
  return (
    <section id="collection" className="scroll-mt-16 bg-navy-deep py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold">The collection</p>
            <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
              Signature pieces in <em className="text-gold">authentic African print.</em>
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-2 border-b border-gold pb-1 text-sm font-semibold uppercase tracking-widest text-gold sm:inline-flex"
          >
            <ShopIcon className="h-4 w-4" /> Shop all
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href="/shop" className={`${btnOutline} gap-2`}>
            <ShopIcon className="h-4 w-4" />
            {products.length > SHOWN ? `View ${products.length - SHOWN} more in shop` : "View all in shop"}
          </Link>
        </div>
      </div>
    </section>
  );
}
