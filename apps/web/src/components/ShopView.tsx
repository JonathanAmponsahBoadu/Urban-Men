"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProducts } from "@/components/CatalogueProvider";
import { CloseIcon } from "@/components/icons";
import { ProductCard } from "@/components/ProductCard";
import type { Colour, Sleeve } from "@/data/products";
import { colourOptions, sleeveOptions } from "@/lib/catalogue";
import { totalStock } from "@/lib/format";
import { btnOutline, input } from "@/lib/ui";

type Sort = "featured" | "price-asc" | "price-desc";
const PAGE_SIZE = 6;

function pick<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return allowed.find((a) => a === value);
}

function Chip({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active ? "border-gold bg-gold font-semibold text-navy" : "border-white/20 text-mist hover:border-gold hover:text-gold"
      }`}
    >
      {children}
    </Link>
  );
}

function PageLink({ to, active, disabled, label, children }: { to: string; active?: boolean; disabled?: boolean; label: string; children: React.ReactNode }) {
  const cls = "flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors";
  if (disabled) return <span aria-disabled className={`${cls} border-white/10 text-mist/40`}>{children}</span>;
  return (
    <Link
      href={to}
      scroll={false}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`${cls} ${active ? "border-gold bg-gold font-semibold text-navy" : "border-white/20 text-ivory hover:border-gold hover:text-gold"}`}
    >
      {children}
    </Link>
  );
}

type Query = { sleeve?: Sleeve; colours: Colour[]; sort: Sort; stock: boolean; q: string; min?: number; max?: number; page: number };

export function ShopView() {
  const router = useRouter();
  const sp = useSearchParams();
  const all = useProducts();

  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const [open, setOpen] = useState(false);

  const num = (v: string | null) => (v !== null && v !== "" && !Number.isNaN(Number(v)) ? Math.max(0, Number(v)) : undefined);
  const query: Query = {
    sleeve: pick(sp.get("sleeve"), sleeveOptions),
    colours: (sp.get("colour") ?? "").split(",").filter((c): c is Colour => (colourOptions as readonly string[]).includes(c)),
    sort: (pick(sp.get("sort"), ["featured", "price-asc", "price-desc"] as const) ?? "featured") as Sort,
    stock: sp.get("stock") === "1",
    q: (sp.get("q") ?? "").trim(),
    min: num(sp.get("min")),
    max: num(sp.get("max")),
    page: Math.max(1, Math.floor(num(sp.get("page")) ?? 1)),
  };

  const href = (over: Partial<Query>) => {
    const next = { ...query, page: 1, ...over };
    const p = new URLSearchParams();
    if (next.sleeve) p.set("sleeve", next.sleeve);
    if (next.colours.length) p.set("colour", next.colours.join(","));
    if (next.sort !== "featured") p.set("sort", next.sort);
    if (next.stock) p.set("stock", "1");
    if (next.q) p.set("q", next.q);
    if (next.min !== undefined) p.set("min", String(next.min));
    if (next.max !== undefined) p.set("max", String(next.max));
    if (next.page > 1) p.set("page", String(next.page));
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };
  const toggleColour = (c: Colour) => href({ colours: query.colours.includes(c) ? query.colours.filter((x) => x !== c) : [...query.colours, c] });

  const needle = query.q.toLowerCase();
  let products = all.filter(
    (p) =>
      (!query.sleeve || p.sleeve === query.sleeve) &&
      (query.colours.length === 0 || query.colours.includes(p.colour)) &&
      (!query.stock || totalStock(p) > 0) &&
      (query.min === undefined || (p.price !== undefined && p.price >= query.min)) &&
      (query.max === undefined || (p.price !== undefined && p.price <= query.max)) &&
      (!needle || [p.name, p.note, p.description, p.colour, p.sleeve ?? "", ...p.features].join(" ").toLowerCase().includes(needle)),
  );
  if (query.sort !== "featured") {
    products = [...products].sort((a, b) => {
      const pa = a.price ?? Number.POSITIVE_INFINITY;
      const pb = b.price ?? Number.POSITIVE_INFINITY;
      return query.sort === "price-asc" ? pa - pb : pb === Number.POSITIVE_INFINITY ? -1 : pb - pa;
    });
  }
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const shown = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // bring the top of the grid into view when the visitor changes page
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ block: "start" });
  }, [page]);

  const priceActive = query.min !== undefined || query.max !== undefined;
  const activeCount = (query.sleeve ? 1 : 0) + query.colours.length + (query.stock ? 1 : 0) + (priceActive ? 1 : 0);
  const removable: { key: string; label: string; to: string }[] = [
    ...(query.sleeve ? [{ key: "sleeve", label: query.sleeve, to: href({ sleeve: undefined }) }] : []),
    ...query.colours.map((c) => ({ key: `c-${c}`, label: c, to: toggleColour(c) })),
    ...(query.stock ? [{ key: "stock", label: "In stock", to: href({ stock: false }) }] : []),
    ...(priceActive
      ? [{ key: "price", label: `GH₵ ${query.min ?? 0}${query.max !== undefined ? ` – ${query.max}` : "+"}`, to: href({ min: undefined, max: undefined }) }]
      : []),
  ];
  const group = "text-xs uppercase tracking-[0.25em] text-mist";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 md:px-10 md:pt-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 border-b border-white/10 pb-3">
        <h1 className="w-full font-display text-2xl sm:mr-auto sm:w-auto leading-none md:text-3xl">
          {query.q ? <>Results for “{query.q}”</> : <>Shop <em className="text-gold">apparels</em></>}
          <span className="ml-3 align-middle font-sans text-sm text-mist" aria-live="polite">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </span>
        </h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-medium transition-colors hover:border-gold hover:text-gold"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
          </svg>
          Filters
          {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-navy">{activeCount}</span>}
        </button>
        <label className="ml-auto flex shrink-0 items-center gap-2 text-sm text-mist sm:ml-0">
          <span className="sr-only">Sort</span>
          <select
            value={query.sort}
            onChange={(e) => router.push(href({ sort: e.target.value as Sort }), { scroll: false })}
            aria-label="Sort"
            className="rounded-full border border-white/20 bg-navy-deep px-3.5 py-2 text-ivory focus:border-gold focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
        {removable.length > 0 && (
          <div className="no-scrollbar order-last flex w-full items-center gap-2 overflow-x-auto">
            {removable.map((r) => (
              <Link key={r.key} href={r.to} scroll={false} aria-label={`Remove filter ${r.label}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 py-1 pl-3 pr-2 text-sm text-gold hover:bg-gold/20">
                {r.label} <CloseIcon className="h-3.5 w-3.5" />
              </Link>
            ))}
            {removable.length > 1 && (
              <Link href="/shop" scroll={false} className="shrink-0 px-2 text-sm text-mist underline-offset-4 hover:text-gold hover:underline">Clear all</Link>
            )}
          </div>
        )}
      </div>

      {/* filter panel: bottom sheet on phones, side panel on larger screens */}
      <div className={`fixed inset-0 z-60 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-2xl bg-navy-deep shadow-2xl transition-transform duration-300 sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-96 sm:rounded-none ${open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"}`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-display text-xl">Filters</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
              <CloseIcon />
            </button>
          </div>
          <div className="no-scrollbar flex-1 space-y-7 overflow-y-auto px-5 py-6">
            <div>
              <p className={group}>Sleeve</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip to={href({ sleeve: undefined })} active={!query.sleeve}>All</Chip>
                {sleeveOptions.map((s) => (
                  <Chip key={s} to={href({ sleeve: s })} active={query.sleeve === s}>{s}</Chip>
                ))}
              </div>
            </div>
            <div>
              <p className={group}>Colour</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip to={href({ colours: [] })} active={query.colours.length === 0}>All</Chip>
                {colourOptions.map((c) => (
                  <Chip key={c} to={toggleColour(c)} active={query.colours.includes(c)}>{c}</Chip>
                ))}
              </div>
            </div>
            <div>
              <p className={group}>Availability</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip to={href({ stock: !query.stock })} active={query.stock}>In stock only</Chip>
              </div>
            </div>
            <form
              key={`${query.min}-${query.max}`}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                router.push(href({ min: num(String(f.get("min") ?? "")), max: num(String(f.get("max") ?? "")) }), { scroll: false });
              }}
            >
              <p className={group}>Price</p>
              <div className="mt-3 flex items-center gap-2">
                <label className="sr-only" htmlFor="min">Minimum price</label>
                <input id="min" name="min" type="number" min={0} defaultValue={query.min} placeholder="Min GH₵" className={`${input} py-2`} />
                <span className="text-mist">to</span>
                <label className="sr-only" htmlFor="max">Maximum price</label>
                <input id="max" name="max" type="number" min={0} defaultValue={query.max} placeholder="Max GH₵" className={`${input} py-2`} />
              </div>
              <button type="submit" className={`${btnOutline} mt-3 w-full py-2`}>Apply price</button>
            </form>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-white/10 p-4">
            <Link href="/shop" scroll={false} className="flex items-center justify-center rounded-full border border-white/20 px-5 text-sm hover:border-gold hover:text-gold">Clear</Link>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-navy hover:bg-gold-deep">
              Show {products.length} {products.length === 1 ? "piece" : "pieces"}
            </button>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <>
          <div ref={gridRef} className="mt-5 grid scroll-mt-20 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-14 flex flex-wrap items-center justify-center gap-2">
              <PageLink to={href({ page: page - 1 })} disabled={page === 1} label="Previous page">‹</PageLink>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <PageLink key={n} to={href({ page: n })} active={n === page} label={`Page ${n}`}>{n}</PageLink>
              ))}
              <PageLink to={href({ page: page + 1 })} disabled={page === pages} label="Next page">›</PageLink>
            </nav>
          )}
        </>
      ) : (
        <div className="mt-16 rounded-sm border border-white/10 p-10 text-center">
          <p className="font-display text-2xl">Nothing matches that.</p>
          <p className="mt-2 text-mist">
            Cannot find what you want? <Link href="/custom-style" className="text-gold underline-offset-4 hover:underline">Request a custom style</Link>.
          </p>
          <Link href="/shop" className="mt-4 inline-block text-gold underline-offset-4 hover:underline">See everything</Link>
        </div>
      )}
    </main>
  );
}
