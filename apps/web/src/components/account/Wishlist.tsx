"use client";

import Link from "next/link";
import { useProducts } from "@/components/CatalogueProvider";
import { ProductCard } from "@/components/ProductCard";
import { useHydrated, useStore } from "@/lib/storage";
import { wishlistStore } from "@/lib/stores";

export function Wishlist() {
  const hydrated = useHydrated();
  const slugs = useStore(wishlistStore);
  const products = useProducts();
  const saved = products.filter((p) => slugs.includes(p.slug));

  return (
    <div>
      <h2 className="font-display text-3xl">Wishlist</h2>
      {!hydrated ? null : saved.length === 0 ? (
        <p className="mt-6 text-mist">
          Nothing saved yet. Tap the heart on any shirt to keep it here. <Link href="/shop" className="text-gold underline-offset-4 hover:underline">Browse the collection</Link>.
        </p>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
