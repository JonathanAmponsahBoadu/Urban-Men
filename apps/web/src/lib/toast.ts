"use client";

import { createStore, uid } from "@/lib/storage";

export type Toast = { id: string; text: string; href?: string; linkLabel?: string };

// not persisted
export const toastStore = createStore<Toast[]>("um.toasts", [], false);

export function showToast(text: string, link?: { href: string; label: string }) {
  const toast: Toast = { id: uid("t"), text, href: link?.href, linkLabel: link?.label };
  toastStore.update((list) => [...list, toast].slice(-3));
  window.setTimeout(() => toastStore.update((list) => list.filter((t) => t.id !== toast.id)), 4000);
}
