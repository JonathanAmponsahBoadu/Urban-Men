"use client";

import Image from "next/image";
import { useState } from "react";
import { patchProduct, useAllProducts, useBaseSlugs } from "@/components/CatalogueProvider";
import { downloadCsv } from "@/lib/csv";
import { displayName, formatPrice, isPreorder, totalStock } from "@/lib/format";
import { useSiteSettings } from "@/lib/settings";
import { useStore } from "@/lib/storage";
import { logActivity, stockLogStore, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES, STOCK_REASONS, type Size, type StockReason } from "@/lib/types";
import { btnOutline, card, input, label } from "@/lib/ui";

const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Inventory: stock by size for every design, with quick adjustments, a reason for each change,
 * low-stock alerts and a history of who changed what. Edits are saved in this browser until the backend exists.
 */
export function InventoryAdmin() {
  const me = useCurrentUser();
  const who = me?.name ?? "Admin";
  const products = useAllProducts();
  const baseSlugs = useBaseSlugs();
  const { lowStockThreshold } = useSiteSettings();
  const log = useStore(stockLogStore);

  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [reason, setReason] = useState<StockReason>("Received new stock");

  const tracked = products.filter((p) => !isPreorder(p));
  const preorders = products.filter(isPreorder);
  const lowSizes = tracked.flatMap((p) => SIZES.filter((s) => p.stock[s] > 0 && p.stock[s] <= lowStockThreshold).map((s) => ({ p, s })));
  const outSizes = tracked.flatMap((p) => SIZES.filter((s) => p.stock[s] <= 0).map((s) => ({ p, s })));
  const units = tracked.reduce((n, p) => n + totalStock(p), 0);
  const value = tracked.reduce((n, p) => n + totalStock(p) * (p.price ?? 0), 0);

  const needle = q.trim().toLowerCase();
  const shown = tracked.filter((p) => {
    if (needle && ![p.name, p.localName ?? "", p.slug, p.colour].join(" ").toLowerCase().includes(needle)) return false;
    if (onlyLow && !SIZES.some((s) => p.stock[s] <= lowStockThreshold)) return false;
    return true;
  });

  const setStock = (slug: string, name: string, size: Size, from: number, to: number) => {
    const next = Math.max(0, Math.floor(to));
    if (next === from) return;
    const product = products.find((p) => p.slug === slug)!;
    patchProduct(slug, { stock: { ...product.stock, [size]: next } }, baseSlugs.has(slug));
    stockLogStore.update((list) =>
      [{ id: `stk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: new Date().toISOString(), who, slug, name, size, from, to: next, reason }, ...list].slice(0, 500),
    );
    logActivity(who, `stock ${name} ${size}: ${from} to ${next} (${reason})`);
    showToast(`${name} ${size}: ${next} in stock`);
  };

  const exportStock = () =>
    downloadCsv("inventory.csv", [
      ["slug", "name", ...SIZES, "total", "price", "stock value"],
      ...tracked.map((p) => [p.slug, displayName(p), ...SIZES.map((s) => p.stock[s]), totalStock(p), p.price, totalStock(p) * (p.price ?? 0)]),
    ]);
  const exportLog = () =>
    downloadCsv("stock-history.csv", [["when", "who", "design", "size", "from", "to", "reason"], ...log.map((e) => [e.at, e.who, e.name, e.size, e.from, e.to, e.reason])]);

  const tile = (title: string, value: string, tone?: "warn" | "bad") => (
    <div className={`${card} p-4`}>
      <p className="text-xs uppercase tracking-[0.2em] text-mist">{title}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone === "bad" ? "text-red-700 dark:text-red-300" : tone === "warn" ? "text-amber-700 dark:text-amber-300" : "text-gold"}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Inventory</h2>
          <p className="mt-2 text-mist">Stock by size. Every change is recorded with who made it and why.</p>
        </div>
        <button type="button" onClick={exportStock} className={btnOutline}>Export stock CSV</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tile("Units in stock", units.toLocaleString("en-GH"))}
        {tile("Stock value", formatPrice(value) ?? "")}
        {tile(`Low (${lowStockThreshold} or fewer)`, String(lowSizes.length), lowSizes.length ? "warn" : undefined)}
        {tile("Sold out sizes", String(outSizes.length), outSizes.length ? "bad" : undefined)}
      </div>

      {(lowSizes.length > 0 || outSizes.length > 0) && (
        <section aria-labelledby="attention" className={`${card} p-5`}>
          <h3 id="attention" className="font-display text-xl">Needs attention</h3>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {outSizes.map(({ p, s }) => <li key={`o-${p.slug}-${s}`} className="rounded-full bg-red-400/15 px-3 py-1 text-red-800 dark:text-red-300">{displayName(p)} · {s} · sold out</li>)}
            {lowSizes.map(({ p, s }) => <li key={`l-${p.slug}-${s}`} className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-800 dark:text-amber-300">{displayName(p)} · {s} · {p.stock[s]} left</li>)}
          </ul>
        </section>
      )}

      <section aria-labelledby="stock">
        <h3 id="stock" className="sr-only">Stock by design</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-56 flex-1">
            <label htmlFor="inv-q" className={label}>Search</label>
            <input id="inv-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, colour…" className={input} />
          </div>
          <div>
            <label htmlFor="inv-reason" className={label}>Reason for the next change</label>
            <select id="inv-reason" value={reason} onChange={(e) => setReason(e.target.value as StockReason)} className={`${input} w-64`}>
              {STOCK_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-3 text-sm">
            <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="h-5 w-5 accent-gold" /> Low or sold out only
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/15 text-xs uppercase tracking-[0.2em] text-mist">
                <th className="py-2 pr-3 font-medium">Design</th>
                {SIZES.map((s) => <th key={s} className="py-2 text-center font-medium">{s}</th>)}
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.slug} className="border-b border-white/10 align-middle">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="relative aspect-4/5 w-10 shrink-0 overflow-hidden rounded-sm bg-navy-deep">
                        <Image src={p.images[0]?.src ?? "/images/products/green-kente-shirt.jpg"} alt="" fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-display text-lg leading-tight">{displayName(p)}</p>
                        <p className="text-xs text-mist">{p.sleeve} · {p.colour}</p>
                      </div>
                    </div>
                  </td>
                  {SIZES.map((s) => {
                    const n = p.stock[s];
                    const tone = n <= 0 ? "border-red-400/60" : n <= lowStockThreshold ? "border-amber-400/60" : "border-white/15";
                    return (
                      <td key={s} className="py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button type="button" aria-label={`Take one off ${displayName(p)} ${s}`} onClick={() => setStock(p.slug, displayName(p), s, n, n - 1)} disabled={n <= 0} className="h-8 w-8 rounded-md border border-white/15 hover:border-gold disabled:opacity-30">−</button>
                          <input
                            key={`${p.slug}-${s}-${n}`}
                            type="number"
                            min={0}
                            defaultValue={n}
                            aria-label={`${displayName(p)} stock size ${s}`}
                            onBlur={(e) => setStock(p.slug, displayName(p), s, n, Number(e.target.value))}
                            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                            className={`w-14 rounded-md border bg-navy-deep px-1 py-1.5 text-center focus:border-gold focus:outline-none ${tone}`}
                          />
                          <button type="button" aria-label={`Add one to ${displayName(p)} ${s}`} onClick={() => setStock(p.slug, displayName(p), s, n, n + 1)} className="h-8 w-8 rounded-md border border-white/15 hover:border-gold">+</button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-3 text-right font-semibold">{totalStock(p)}</td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={SIZES.length + 2} className="py-8 text-center text-mist">Nothing to show.</td></tr>}
            </tbody>
          </table>
        </div>
        {preorders.length > 0 && (
          <p className="mt-4 text-sm text-mist">
            Pre-order designs are made to order, so their stock is not tracked here: {preorders.map((p) => displayName(p)).join(", ")}.
          </p>
        )}
      </section>

      <section aria-labelledby="history">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="history" className="font-display text-xl">Stock history</h3>
          {log.length > 0 && <button type="button" onClick={exportLog} className="text-sm text-gold underline-offset-4 hover:underline">Export history CSV</button>}
        </div>
        {log.length === 0 ? (
          <p className="mt-3 text-sm text-mist">No changes yet. Adjust a number above and it is recorded here.</p>
        ) : (
          <ul className="mt-3 max-h-96 divide-y divide-white/10 overflow-y-auto text-sm">
            {log.slice(0, 100).map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span><span className="font-semibold">{e.name}</span> · {e.size}: {e.from} → <span className={e.to > e.from ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>{e.to}</span> <span className="text-mist">· {e.reason}</span></span>
                <span className="text-xs text-mist">{e.who} · {fmtTime(e.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
