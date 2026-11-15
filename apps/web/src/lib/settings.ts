"use client";

// Store-wide settings the admin can edit (frontend-only: saved in this browser for now).
import { createStore, useStore } from "@/lib/storage";

export type SiteSettings = {
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  facebookUrl: string;
  email: string;
  address: string;
  hours: string;
  /** DRAFT value: confirm before launch. Shown on the delivery & returns page. */
  returnWindowDays: number;
  /** product slugs shown in the homepage slideshow */
  heroSlugs: string[];
  /** while true, legal/policy pages show a "draft, under review" banner */
  policiesDraft: boolean;
  /** DRAFT value: share of a pre-order paid at checkout; the rest is paid before delivery */
  preorderDepositPercent: number;
  /** a size with this many units or fewer counts as low stock (inventory alerts) */
  lowStockThreshold: number;
};

export const defaultSettings: SiteSettings = {
  announcementEnabled: false,
  announcementText: "",
  announcementLink: "",
  facebookUrl: "",
  email: "",
  address: "",
  hours: "",
  returnWindowDays: 7,
  heroSlugs: ["deep-pink-kente-shirt", "white-adinkra-shirt", "emerald-green-accent-shirt", "cream-luxe-shirt"],
  policiesDraft: true,
  preorderDepositPercent: 50,
  lowStockThreshold: 3,
};

export const settingsStore = createStore<Partial<SiteSettings>>("um.settings", {});

export function useSiteSettings(): SiteSettings {
  const overrides = useStore(settingsStore);
  return { ...defaultSettings, ...overrides };
}

export function saveSettings(patch: Partial<SiteSettings>) {
  return settingsStore.update((cur) => ({ ...cur, ...patch }));
}
