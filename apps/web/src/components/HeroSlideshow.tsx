"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type Slide = { image: string; alt: string; name: string };

const INTERVAL_MS = 3000;

export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % slides.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, slides.length]);

  return (
    <div
      className="relative mx-auto aspect-4/5 w-full max-w-xs overflow-hidden rounded-sm bg-navy-soft ring-1 ring-gold/30 sm:max-w-sm md:max-w-md lg:h-full lg:max-h-full lg:w-auto lg:max-w-full"
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured looks"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <Image
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          fill
          preload={i === 0}
          sizes="(min-width: 768px) 45vw, 90vw"
          aria-hidden={i !== active}
          className={`object-cover transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div data-theme="dark" className="absolute inset-x-0 bottom-0 bg-linear-to-t from-navy-deep/90 to-transparent px-5 pb-5 pt-20">
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-gold">
          Signature collection
        </p>
        <p
          className="font-display text-xl"
          aria-live={paused ? "polite" : "off"}
        >
          {slides[active].name}
        </p>
        <div className="mt-4 flex gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${slide.name}`}
              aria-current={i === active}
              className="group flex h-6 items-center"
            >
              <span
                className={`block h-0.5 w-8 transition-colors ${
                  i === active
                    ? "bg-gold"
                    : "bg-white/40 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
