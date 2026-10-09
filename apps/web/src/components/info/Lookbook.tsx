"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/components/CatalogueProvider";
import { Reveal } from "@/components/Reveal";

export function LookbookGallery() {
  const products = useProducts();
  const looks = products.flatMap((p) => p.images.filter((i) => i.kind === "photo").map((img) => ({ p, img })));
  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
      {looks.map(({ p, img }, i) => (
        <li key={`${p.slug}-${i}`} className="break-inside-avoid">
          <Reveal>
            <Link href={`/shop/${p.slug}`} className="group relative block overflow-hidden rounded-sm bg-navy-soft">
              <div className={`relative ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-deep/90 to-transparent px-5 pb-5 pt-16 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
                <p className="font-display text-xl">{p.name}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">Shop this look</p>
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
