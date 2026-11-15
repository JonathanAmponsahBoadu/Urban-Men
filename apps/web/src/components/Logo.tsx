const files = {
  full: { src: "/brand/logo-full-black.png", w: 1600, h: 1702, label: "Urban Men Apparel — Signature Collections" },
  monogram: { src: "/brand/logo-monogram-black.png", w: 896, h: 1011, label: "Urban Men" },
  wordmark: { src: "/brand/logo-wordmark-black.png", w: 1600, h: 962, label: "Urban Men Apparel" },
} as const;

/**
 * The brand logo, coloured by the active theme (gold on dark, navy on light).
 * Give it a size with className (e.g. "h-10" or "w-64"); the shape keeps its proportions.
 */
export function Logo({ variant, className = "", decorative = false }: { variant: keyof typeof files; className?: string; decorative?: boolean }) {
  const f = files[variant];
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : f.label}
      aria-hidden={decorative || undefined}
      className={`logo-mark ${className}`}
      style={{ aspectRatio: `${f.w} / ${f.h}`, WebkitMaskImage: `url(${f.src})`, maskImage: `url(${f.src})` }}
    />
  );
}
