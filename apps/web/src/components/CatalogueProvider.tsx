"use client";

// Gives every client component the product list: the built-in products plus
// whatever the admin added/edited in this browser (frontend-only stand-in for the backend).
import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/data/products";
import { catalogueEditsStore, type CatalogueEdits } from "@/lib/stores";
import { useStore } from "@/lib/storage";

type Ctx = { base: Product[] };
const CatalogueContext = createContext<Ctx>({ base: [] });

export function mergeCatalogue(base: Product[], edits: CatalogueEdits): Product[] {
  const removed = new Set(edits.removed);
  const fromBase = base
    .filter((p) => !removed.has(p.slug))
    .map((p) => ({ ...p, ...(edits.patches[p.slug] ?? {}) }));
  return [...fromBase, ...edits.added.filter((p) => !removed.has(p.slug))];
}

export function CatalogueProvider({ base, children }: { base: Product[]; children: React.ReactNode }) {
  const value = useMemo(() => ({ base }), [base]);
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

/** Every product, including ones the admin hid. For the admin screens. */
export function useAllProducts(): Product[] {
  const { base } = useContext(CatalogueContext);
  const edits = useStore(catalogueEditsStore);
  return useMemo(() => mergeCatalogue(base, edits), [base, edits]);
}

/** Only products shoppers may see (the admin can hide any product). */
export function useProducts(): Product[] {
  const all = useAllProducts();
  return useMemo(() => all.filter((p) => p.published !== false), [all]);
}

export function useProduct(slug: string): Product | undefined {
  const all = useAllProducts();
  return all.find((p) => p.slug === slug);
}

export function useBaseSlugs(): Set<string> {
  const { base } = useContext(CatalogueContext);
  return useMemo(() => new Set(base.map((p) => p.slug)), [base]);
}

/* ---------- admin actions ---------- */
export function saveProduct(product: Product, isBase: boolean): boolean {
  return catalogueEditsStore.update((edits) =>
    isBase
      ? { ...edits, patches: { ...edits.patches, [product.slug]: product } }
      : {
          ...edits,
          added: edits.added.some((p) => p.slug === product.slug)
            ? edits.added.map((p) => (p.slug === product.slug ? product : p))
            : [...edits.added, product],
        },
  );
}

export function patchProduct(slug: string, patch: Partial<Product>, isBase: boolean): boolean {
  return catalogueEditsStore.update((edits) =>
    isBase
      ? { ...edits, patches: { ...edits.patches, [slug]: { ...edits.patches[slug], ...patch } } }
      : { ...edits, added: edits.added.map((p) => (p.slug === slug ? { ...p, ...patch } : p)) },
  );
}

export function deleteProduct(slug: string, isBase: boolean): boolean {
  return catalogueEditsStore.update((edits) =>
    isBase
      ? { ...edits, removed: [...new Set([...edits.removed, slug])] }
      : { ...edits, added: edits.added.filter((p) => p.slug !== slug) },
  );
}

export function restoreBaseProduct(slug: string): boolean {
  return catalogueEditsStore.update((edits) => {
    const patches = { ...edits.patches };
    delete patches[slug];
    return { ...edits, patches, removed: edits.removed.filter((s) => s !== slug) };
  });
}
