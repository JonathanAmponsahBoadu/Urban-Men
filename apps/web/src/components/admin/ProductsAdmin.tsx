"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { deleteProduct, patchProduct, restoreBaseProduct, useAllProducts, useBaseSlugs } from "@/components/CatalogueProvider";
import { downloadCsv, parseCsv } from "@/lib/csv";
import { displayName, formatPrice, totalStock } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { catalogueEditsStore, logActivity, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES } from "@/lib/types";
import { btnGhost, btnOutline, btnPrimary, card, input } from "@/lib/ui";

const cell = "w-14 rounded-md border border-white/15 bg-navy-deep px-2 py-1.5 text-center text-sm focus:border-gold focus:outline-none";

export function ProductsAdmin() {
  const me = useCurrentUser();
  const who = me?.name ?? "Admin";
  const products = useAllProducts();
  const baseSlugs = useBaseSlugs();
  const edits = useStore(catalogueEditsStore);
  const fileInput = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const toInt = (v: string) => Math.max(0, Math.floor(Number(v) || 0));
  const toMoney = (v: string) => Math.max(0, Math.round((Number(v) || 0) * 100) / 100);

  const needle = q.trim().toLowerCase();
  const shown = products.filter((p) => !needle || [p.name, p.localName ?? "", p.slug, p.colour, p.sleeve].join(" ").toLowerCase().includes(needle));
  const pickedShown = shown.filter((p) => picked.includes(p.slug));
  const allPicked = shown.length > 0 && pickedShown.length === shown.length;

  const toggle = (slug: string) => setPicked((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
  const apply = (fn: (slug: string, isBase: boolean) => void, message: string) => {
    pickedShown.forEach((p) => fn(p.slug, baseSlugs.has(p.slug)));
    logActivity(who, `${message} for ${pickedShown.length} product${pickedShown.length === 1 ? "" : "s"}`);
    showToast(`${message}: ${pickedShown.length} updated`);
  };

  const exportCsv = () =>
    downloadCsv("products.csv", [
      ["slug", "name", "price", ...SIZES.map((s) => `stock_${s}`), "visible"],
      ...products.map((p) => [p.slug, p.name, p.price, ...SIZES.map((s) => p.stock[s]), p.published !== false ? "yes" : "no"]),
    ]);

  const importCsv = async (file: File | undefined) => {
    if (!file) return;
    const rows = parseCsv(await file.text());
    const head = rows[0]?.map((h) => h.trim().toLowerCase()) ?? [];
    const col = (name: string) => head.indexOf(name);
    if (col("slug") < 0) {
      showToast("The CSV needs a 'slug' column");
      return;
    }
    let updated = 0;
    let skipped = 0;
    for (const r of rows.slice(1)) {
      const p = products.find((x) => x.slug === r[col("slug")]?.trim());
      if (!p) { skipped++; continue; }
      const patch: Partial<typeof p> = {};
      if (col("price") >= 0 && r[col("price")]?.trim() !== "") patch.price = toMoney(r[col("price")]);
      const stock = { ...p.stock };
      let touched = false;
      for (const s of SIZES) {
        const i = col(`stock_${s.toLowerCase()}`);
        if (i >= 0 && r[i]?.trim() !== "") { stock[s] = toInt(r[i]); touched = true; }
      }
      if (touched) patch.stock = stock;
      if (col("visible") >= 0 && r[col("visible")]) patch.published = !/^(no|false|0|hidden)$/i.test(r[col("visible")].trim());
      patchProduct(p.slug, patch, baseSlugs.has(p.slug));
      updated++;
    }
    logActivity(who, `imported a CSV: ${updated} updated, ${skipped} skipped`);
    showToast(`CSV imported: ${updated} updated, ${skipped} skipped`);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Products &amp; stock</h2>
        <Link href="/admin/products/new" className={btnPrimary}>Add a new style</Link>
      </div>
      <p className="mt-2 text-mist">Change a price or stock count and it updates on the shop straight away. Click a name to edit everything.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor="prod-q">Search products</label>
        <input id="prod-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={`${input} max-w-xs py-2`} />
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" className={btnGhost} onClick={exportCsv}>Export CSV</button>
          <button type="button" className={btnGhost} onClick={() => fileInput.current?.click()}>Import CSV</button>
          <input ref={fileInput} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Import products from a CSV file" onChange={(e) => importCsv(e.target.files?.[0])} />
        </div>
      </div>
      <p className="mt-2 text-xs text-mist">Import updates price, stock (columns stock_s … stock_xxl) and visible for the slugs it finds. Export first to get the right layout.</p>

      <div className="mt-5 flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allPicked} onChange={() => setPicked(allPicked ? [] : shown.map((p) => p.slug))} className="h-5 w-5 accent-gold" /> Select all shown
        </label>
        <span className="text-mist">{pickedShown.length} selected</span>
      </div>

      {pickedShown.length > 0 && (
        <div role="region" aria-label="Bulk edit" className="sticky top-20 z-20 mt-3 flex flex-wrap items-end gap-4 rounded-md border border-gold/50 bg-navy-deep p-4 shadow-xl">
          <label className="text-xs uppercase tracking-[0.2em] text-mist">Set price (GH₵)
            <span className="mt-1 flex gap-2">
              <input type="number" min={0} step="0.01" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} className={`${cell} w-24`} />
              <button type="button" disabled={bulkPrice === ""} className={btnOutline} onClick={() => { apply((s, b) => patchProduct(s, { price: toMoney(bulkPrice) }, b), `set price to ${bulkPrice}`); setBulkPrice(""); }}>Apply</button>
            </span>
          </label>
          <label className="text-xs uppercase tracking-[0.2em] text-mist">Add units to every size
            <span className="mt-1 flex gap-2">
              <input type="number" min={0} value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} className={`${cell} w-20`} />
              <button type="button" disabled={bulkStock === ""} className={btnOutline} onClick={() => { apply((s, b) => { const p = products.find((x) => x.slug === s)!; patchProduct(s, { stock: Object.fromEntries(SIZES.map((z) => [z, p.stock[z] + toInt(bulkStock)])) as typeof p.stock }, b); }, `added ${bulkStock} units per size`); setBulkStock(""); }}>Add</button>
            </span>
          </label>
          <button type="button" className={btnOutline} onClick={() => apply((s, b) => patchProduct(s, { published: true }, b), "made visible")}>Show on shop</button>
          <button type="button" className={btnOutline} onClick={() => apply((s, b) => patchProduct(s, { published: false }, b), "hid")}>Hide from shop</button>
          <button type="button" className="text-sm text-mist underline-offset-4 hover:underline" onClick={() => setPicked([])}>Clear selection</button>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {shown.map((p) => {
          const isBase = baseSlugs.has(p.slug);
          const live = p.published !== false;
          return (
            <li key={p.slug} className={`${card} p-4 sm:p-5 ${picked.includes(p.slug) ? "border-gold/60" : ""}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-4">
                  <input type="checkbox" checked={picked.includes(p.slug)} onChange={() => toggle(p.slug)} aria-label={`Select ${p.name}`} className="h-5 w-5 shrink-0 accent-gold" />
                  <div className="relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-sm bg-navy-deep">
                    <Image src={p.images[0]?.src ?? "/images/products/green-kente-shirt.jpg"} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <Link href={`/admin/products/${p.slug}`} className="font-display text-xl hover:text-gold">{displayName(p)}</Link>{p.localName && <p className="text-xs text-mist">{p.name}</p>}
                    <p className="text-sm text-mist">
                      {p.sleeve} · {p.colour} · {totalStock(p)} in stock · {p.includesTrousers === false ? "shirt only" : "with trousers"}
                      {!isBase && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">New</span>}
                    </p>
                    <p className="text-sm text-gold">{formatPrice(p.price) ?? "No price"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-mist">
                    Price (GH₵)
                    <input
                      key={`${p.slug}-price-${p.price}`}
                      type="number"
                      min={0}
                      step="0.01"
                      defaultValue={p.price ?? ""}
                      onBlur={(e) => {
                        const v = e.target.value === "" ? undefined : toMoney(e.target.value);
                        if (v !== p.price) { patchProduct(p.slug, { price: v }, isBase); logActivity(who, `changed the price of ${p.name} to ${v ?? "none"}`); showToast("Price updated"); }
                      }}
                      className={`${cell} mt-1 block w-24`}
                    />
                  </label>
                  <fieldset>
                    <legend className="text-xs uppercase tracking-[0.2em] text-mist">Stock by size</legend>
                    <div className="mt-1 flex gap-2">
                      {SIZES.map((s) => (
                        <label key={s} className="text-center text-xs text-mist">
                          {s}
                          <input
                            key={`${p.slug}-${s}-${p.stock[s]}`}
                            type="number"
                            min={0}
                            aria-label={`${p.name} stock size ${s}`}
                            defaultValue={p.stock[s]}
                            onBlur={(e) => {
                              const v = toInt(e.target.value);
                              if (v !== p.stock[s]) { patchProduct(p.slug, { stock: { ...p.stock, [s]: v } }, isBase); logActivity(who, `set ${p.name} size ${s} stock to ${v}`); showToast("Stock updated"); }
                            }}
                            className={`${cell} mt-1 block`}
                          />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="flex items-center gap-3 lg:flex-col lg:items-stretch">
                  <button
                    type="button"
                    onClick={() => { patchProduct(p.slug, { published: !live }, isBase); logActivity(who, `${live ? "hid" : "showed"} ${p.name}`); }}
                    aria-pressed={live}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${live ? "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300" : "bg-white/10 text-mist"}`}
                  >
                    {live ? "Visible" : "Hidden"}
                  </button>
                  <Link href={`/admin/products/${p.slug}`} className={btnGhost}>Edit</Link>
                  <button
                    type="button"
                    className="text-sm text-mist underline-offset-4 hover:text-red-300 hover:underline"
                    onClick={() => {
                      if (window.confirm(`Delete “${p.name}”? ${isBase ? "You can restore built-in products later." : "This cannot be undone."}`)) {
                        deleteProduct(p.slug, isBase);
                        logActivity(who, `deleted ${p.name}`);
                        showToast("Product deleted");
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {shown.length === 0 && <li className="text-mist">Nothing matches.</li>}
      </ul>

      {edits.removed.length > 0 && (
        <div className={`${card} mt-8 p-5`}>
          <p className="font-semibold">Deleted built-in products</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {edits.removed.map((slug) => (
              <li key={slug}><button type="button" className={btnOutline} onClick={() => restoreBaseProduct(slug)}>Restore {slug}</button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
