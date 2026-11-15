"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/components/CatalogueProvider";
import { displayName, isPreorder } from "@/lib/format";
import { btnPrimary } from "@/lib/ui";

/** Home page teaser for the pre-order section; hidden while nothing is open for pre-order. */
export function PreorderBand() {
  const items = useProducts().filter(isPreorder);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="preorder-band" className="bg-navy py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">Pre-order</p>
          <h2 id="preorder-band" className="mt-3 font-display text-3xl leading-tight md:text-5xl">
            New designs, <em className="text-gold">made for you.</em>
          </h2>
          <p className="mt-4 max-w-md text-lg text-mist">
            Reserve the next pieces before they are made. Pick your design and size, pay a deposit, and we make it for you.
          </p>
          <Link href="/pre-order" className={`${btnPrimary} mt-7`}>See pre-order designs</Link>
        </div>
        <ul className="grid grid-cols-3 gap-3 md:gap-4">
          {items.slice(0, 3).map((p) => (
            <li key={p.slug}>
              <Link href={`/shop/${p.slug}`} className="group block">
                <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-navy-soft">
                  <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width: 1024px) 18vw, 30vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-navy">Pre-order</span>
                </div>
                <p className="mt-2 truncate font-display text-lg group-hover:text-gold">{displayName(p)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
