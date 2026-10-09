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
  heroSlugs: ["emerald-kente-shirt", "midnight-panel-shirt", "sunburst-shirt", "wave-band-shirt"],
  policiesDraft: true,
};

export const settingsStore = createStore<Partial<SiteSettings>>("um.settings", {});

export function useSiteSettings(): SiteSettings {
  const overrides = useStore(settingsStore);
  return { ...defaultSettings, ...overrides };
}

export function saveSettings(patch: Partial<SiteSettings>) {
  return settingsStore.update((cur) => ({ ...cur, ...patch }));
}
