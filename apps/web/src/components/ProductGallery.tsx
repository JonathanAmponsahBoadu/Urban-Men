"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon, CloseIcon } from "@/components/icons";
import type { ProductImage } from "@/data/products";

function Lightbox({ images, start, onClose }: { images: ProductImage[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const prev = () => setI((n) => Math.max(0, n - 1));
  const next = () => setI((n) => Math.min(images.length - 1, n + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const img = images[i];
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-90 flex items-center justify-center bg-black/90">
      <button type="button" onClick={onClose} aria-label="Close photo viewer" className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
        <CloseIcon />
      </button>
      <div className="relative h-[88vh] w-[94vw] max-w-3xl">
        <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" priority />
      </div>
      {images.length > 1 && (
        <>
          <button type="button" onClick={prev} disabled={i === 0} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:hidden">
            <ChevronIcon dir="left" className="h-6 w-6" />
          </button>
          <button type="button" onClick={next} disabled={i === images.length - 1} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:hidden">
            <ChevronIcon dir="right" className="h-6 w-6" />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm">{i + 1} / {images.length}</p>
        </>
      )}
    </div>
  );
}

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  const goTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    const index = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== active) setActive(index);
  };

  return (
    <div>
      <div
        className="group relative"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${name} photos`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(active + 1);
          if (e.key === "ArrowLeft") goTo(active - 1);
        }}
      >
        <div ref={scroller} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-sm ring-1 ring-gold/30 scrollbar-none">
          {images.map((img, i) => (
            <button
              type="button"
              key={`${i}-${img.src.slice(-24)}`}
              onClick={() => setZoom(i)}
              aria-label={`Zoom photo ${i + 1} of ${images.length}`}
              className={`relative aspect-4/5 w-full shrink-0 cursor-zoom-in snap-center ${img.kind === "flat" ? "bg-[#e8ebf0]" : "bg-navy-soft"}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                preload={i === 0}
                sizes="(min-width: 1024px) 45vw, 95vw"
                className={img.kind === "flat" ? "object-contain" : "object-cover"}
                draggable={false}
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy/80 text-ivory opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100 disabled:hidden max-md:opacity-100">
              <ChevronIcon dir="left" className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => goTo(active + 1)} disabled={active === images.length - 1} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy/80 text-ivory opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100 disabled:hidden max-md:opacity-100">
              <ChevronIcon dir="right" className="h-5 w-5" />
            </button>
          </>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-navy/80 px-3 py-1 text-xs backdrop-blur">
          {images.length > 1 ? `${active + 1} / ${images.length} · ` : ""}Tap to zoom
        </span>
      </div>

      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-5 gap-3" aria-label="Choose a photo">
          {images.map((img, i) => (
            <li key={`${i}-${img.src.slice(-24)}`}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={`relative block aspect-4/5 w-full overflow-hidden rounded-sm transition ${img.kind === "flat" ? "bg-[#e8ebf0]" : "bg-navy-soft"} ${i === active ? "ring-2 ring-gold" : "opacity-60 ring-1 ring-white/20 hover:opacity-100"}`}
              >
                <Image src={img.src} alt="" fill sizes="12vw" className={img.kind === "flat" ? "object-contain" : "object-cover"} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom !== null && <Lightbox images={images} start={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
