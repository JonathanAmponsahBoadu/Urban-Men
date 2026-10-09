"use client";

import { useProducts } from "@/components/CatalogueProvider";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { useSiteSettings } from "@/lib/settings";

/** Slideshow fed by the products the admin picked under Homepage settings. */
export function HeroSlides() {
  const { heroSlugs } = useSiteSettings();
  const products = useProducts();
  let picks = heroSlugs.flatMap((slug) => products.find((p) => p.slug === slug && p.images.length > 0) ?? []);
  if (picks.length === 0) picks = products.filter((p) => p.images.length > 0).slice(0, 4);
  if (picks.length === 0) return null;
  const slides = picks.map((p) => ({ image: p.images[0].src, alt: p.images[0].alt, name: p.name }));
  return <HeroSlideshow key={slides.map((s) => s.image.slice(-30)).join("|")} slides={slides} />;
}
