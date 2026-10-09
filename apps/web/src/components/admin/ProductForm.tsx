"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { saveProduct, useAllProducts, useBaseSlugs } from "@/components/CatalogueProvider";
import type { Badge, Colour, Product, ProductImage, Sleeve } from "@/data/products";
import { colourOptions, sleeveOptions } from "@/lib/catalogue";
import { compressImage } from "@/lib/images";
import { logActivity, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES, type Size } from "@/lib/types";
import { btnGhost, btnOutline, btnPrimary, input, label } from "@/lib/ui";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

type Draft = {
  name: string;
  slug: string;
  note: string;
  description: string;
  sleeve: Sleeve;
  colour: Colour;
  price: string;
  compareAt: string;
  badge: Badge | "";
  includesTrousers: boolean;
  stock: Record<Size, string>;
  features: string;
  published: boolean;
  images: ProductImage[];
};

function toDraft(p?: Product): Draft {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    note: p?.note ?? "",
    description: p?.description ?? "",
    sleeve: p?.sleeve ?? "Long sleeve",
    colour: p?.colour ?? "White",
    price: p?.price !== undefined ? String(p.price) : "",
    compareAt: p?.compareAtPrice !== undefined ? String(p.compareAtPrice) : "",
    badge: p?.badge ?? "",
    includesTrousers: p?.includesTrousers !== false,
    stock: Object.fromEntries(SIZES.map((s) => [s, String(p?.stock[s] ?? 0)])) as Record<Size, string>,
    features: p?.features.join("\n") ?? "",
    published: p?.published !== false,
    images: p?.images ?? [],
  };
}

function Editor({ existing }: { existing?: Product }) {
  const router = useRouter();
  const all = useAllProducts();
  const baseSlugs = useBaseSlugs();
  const me = useCurrentUser();
  const fileInput = useRef<HTMLInputElement>(null);
  const [d, setD] = useState<Draft>(() => toDraft(existing));
  const [slugTouched, setSlugTouched] = useState(Boolean(existing));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((cur) => ({ ...cur, [k]: v }));

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setBusy(true);
    try {
      const added = await Promise.all(
        [...files].map(async (f): Promise<ProductImage> => ({
          src: await compressImage(f, 1200, 0.82),
          alt: d.name || "Product photo",
          kind: "photo",
        })),
      );
      setD((cur) => ({ ...cur, images: [...cur.images, ...added] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add that photo.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const move = (i: number, dir: -1 | 1) =>
    setD((cur) => {
      const imgs = [...cur.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return cur;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...cur, images: imgs };
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = existing ? existing.slug : slugify(d.slug || d.name);
    if (!d.name.trim()) return setError("Give the style a name.");
    if (!slug) return setError("The web address (slug) cannot be empty.");
    if (!existing && all.some((p) => p.slug === slug)) return setError("Another product already uses that web address. Change the slug.");
    if (d.images.length === 0) return setError("Add at least one photo.");
    const price = d.price.trim() === "" ? undefined : Math.max(0, Math.round(Number(d.price) * 100) / 100);
    if (price !== undefined && Number.isNaN(price)) return setError("Price must be a number.");

    const compareAtPrice = d.compareAt.trim() === "" ? undefined : Math.max(0, Math.round(Number(d.compareAt) * 100) / 100);
    if (compareAtPrice !== undefined && Number.isNaN(compareAtPrice)) return setError("The old price must be a number.");
    if (compareAtPrice !== undefined && price !== undefined && compareAtPrice <= price) return setError("The old price should be higher than the current price, or leave it empty.");

    const product: Product = {
      ...(existing ?? {}),
      slug,
      name: d.name.trim(),
      note: d.note.trim() || d.name.trim(),
      description: d.description.trim(),
      sleeve: d.sleeve,
      colour: d.colour,
      features: d.features.split("\n").map((f) => f.trim()).filter(Boolean),
      price,
      compareAtPrice,
      badge: d.badge || undefined,
      includesTrousers: d.includesTrousers,
      stock: Object.fromEntries(SIZES.map((s) => [s, Math.max(0, Math.floor(Number(d.stock[s]) || 0))])) as Record<Size, number>,
      published: d.published,
      images: d.images.map((img) => ({ ...img, alt: img.alt || d.name.trim() })),
    };
    const ok = saveProduct(product, baseSlugs.has(slug));
    if (!ok) return setError("Your browser ran out of room to save photos. Remove a photo or use smaller ones.");
    logActivity(me?.name ?? "Admin", `${existing ? "edited" : "added"} ${product.name}`);
    showToast(existing ? "Changes saved" : "New style added");
    router.push("/admin/products");
  };

  return (
    <form onSubmit={submit} className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">{existing ? `Edit: ${existing.name}` : "Add a new style"}</h2>
        {existing && <Link href={`/shop/${existing.slug}`} className="text-sm text-gold underline-offset-4 hover:underline">View on shop ↗</Link>}
      </div>

      <fieldset className="space-y-6">
        <legend className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">Photos</legend>
        <p className="text-sm text-mist">First photo is the main one. Use “Model” for people wearing it and “Studio” for the shirt on its own.</p>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {d.images.map((img, i) => (
            <li key={`${i}-${img.src.slice(-24)}`} className="rounded-sm border border-white/10 bg-navy-soft p-2">
              <div className={`relative aspect-4/5 overflow-hidden rounded-sm ${img.kind === "flat" ? "bg-[#e8ebf0]" : "bg-navy-deep"}`}>
                <Image src={img.src} alt={img.alt} fill sizes="200px" className={img.kind === "flat" ? "object-contain" : "object-cover"} />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-bold text-navy">Main</span>}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1">
                <select
                  aria-label={`Photo ${i + 1} type`}
                  value={img.kind}
                  onChange={(e) => set("images", d.images.map((x, j) => (j === i ? { ...x, kind: e.target.value as ProductImage["kind"] } : x)))}
                  className="rounded-md border border-white/15 bg-navy-deep px-2 py-1 text-xs"
                >
                  <option value="photo">Model</option>
                  <option value="flat">Studio</option>
                </select>
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="h-7 w-7 rounded-md border border-white/15 disabled:opacity-30">←</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === d.images.length - 1} aria-label="Move later" className="h-7 w-7 rounded-md border border-white/15 disabled:opacity-30">→</button>
                  <button type="button" onClick={() => set("images", d.images.filter((_, j) => j !== i))} aria-label="Remove photo" className="h-7 w-7 rounded-md border border-white/15 text-red-300">✕</button>
                </span>
              </div>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="flex aspect-4/5 w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-gold/50 text-gold hover:bg-gold/10 disabled:opacity-50"
            >
              <span className="text-3xl leading-none">+</span>
              <span className="text-sm">{busy ? "Adding…" : "Add photos"}</span>
            </button>
          </li>
        </ul>
        <input ref={fileInput} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} className="sr-only" aria-label="Choose product photos" />
      </fieldset>

      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">Basics</legend>
        <div className="sm:col-span-2">
          <label htmlFor="p-name" className={label}>Name</label>
          <input
            id="p-name"
            value={d.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            className={input}
            placeholder="The Royal Kente Shirt"
          />
        </div>
        <div>
          <label htmlFor="p-slug" className={label}>Web address</label>
          <input
            id="p-slug"
            value={d.slug}
            disabled={Boolean(existing)}
            onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
            className={`${input} disabled:opacity-60`}
          />
          <p className="mt-1 text-xs text-mist">/shop/{d.slug || "…"}</p>
        </div>
        <div>
          <label htmlFor="p-price" className={label}>Price (GH₵)</label>
          <input id="p-price" type="number" min={0} step="0.01" value={d.price} onChange={(e) => set("price", e.target.value)} className={input} placeholder="e.g. 550" />
        </div>
        <div>
          <label htmlFor="p-compare" className={label}>Old price (GH₵, optional, shows crossed out)</label>
          <input id="p-compare" type="number" min={0} step="0.01" value={d.compareAt} onChange={(e) => set("compareAt", e.target.value)} className={input} placeholder="e.g. 400" />
        </div>
        <div>
          <label htmlFor="p-badge" className={label}>Badge (optional)</label>
          <select id="p-badge" value={d.badge} onChange={(e) => set("badge", e.target.value as Badge | "")} className={input}>
            <option value="">None</option>
            <option>New</option>
            <option>Best seller</option>
            <option>Limited</option>
          </select>
        </div>
        <label className="flex items-start gap-3 sm:col-span-2">
          <input type="checkbox" checked={d.includesTrousers} onChange={(e) => set("includesTrousers", e.target.checked)} className="mt-1 h-5 w-5 accent-gold" />
          <span>
            Comes with matching trousers
            <span className="block text-sm text-mist">Untick this if the shirt is sold on its own. The product page will then say &ldquo;Shirt only&rdquo;.</span>
          </span>
        </label>
        <div>
          <label htmlFor="p-sleeve" className={label}>Sleeve</label>
          <select id="p-sleeve" value={d.sleeve} onChange={(e) => set("sleeve", e.target.value as Sleeve)} className={input}>
            {sleeveOptions.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="p-colour" className={label}>Base colour</label>
          <select id="p-colour" value={d.colour} onChange={(e) => set("colour", e.target.value as Colour)} className={input}>
            {colourOptions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-note" className={label}>Short line (shown on cards)</label>
          <input id="p-note" value={d.note} onChange={(e) => set("note", e.target.value)} className={input} placeholder="White shirt with green and gold kente panel" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-desc" className={label}>Description</label>
          <textarea id="p-desc" rows={4} value={d.description} onChange={(e) => set("description", e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-feat" className={label}>Features (one per line)</label>
          <textarea id="p-feat" rows={5} value={d.features} onChange={(e) => set("features", e.target.value)} className={input} placeholder={"Green and gold print panel\nBlack buttons"} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">Stock by size</legend>
        <div className="flex flex-wrap gap-4">
          {SIZES.map((s) => (
            <label key={s} className="text-center text-sm text-mist">
              {s}
              <input type="number" min={0} value={d.stock[s]} onChange={(e) => set("stock", { ...d.stock, [s]: e.target.value })} className={`${input} mt-1 w-24 text-center`} />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-3">
        <input type="checkbox" checked={d.published} onChange={(e) => set("published", e.target.checked)} className="h-5 w-5 accent-gold" />
        <span>Visible on the shop</span>
      </label>

      {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btnPrimary} disabled={busy}>{existing ? "Save changes" : "Add to shop"}</button>
        <Link href="/admin/products" className={btnGhost}>Cancel</Link>
        {!existing && <button type="button" className={btnOutline} onClick={() => setD(toDraft())}>Reset</button>}
      </div>
    </form>
  );
}

export function ProductForm({ slug }: { slug?: string }) {
  const all = useAllProducts();
  if (!slug) return <Editor />;
  const existing = all.find((p) => p.slug === slug);
  if (!existing) {
    return (
      <div>
        <p className="text-mist">We could not find that product.</p>
        <Link href="/admin/products" className="mt-4 inline-block text-gold underline-offset-4 hover:underline">Back to products</Link>
      </div>
    );
  }
  // key so switching products re-initialises the form
  return <Editor key={existing.slug} existing={existing} />;
}
