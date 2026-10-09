"use client";

import Link from "next/link";
import { CloseIcon } from "@/components/icons";
import { createStore, useHydrated, useStore } from "@/lib/storage";
import { useSiteSettings } from "@/lib/settings";

// remembers which message the visitor dismissed, so a new message shows again
const dismissedStore = createStore<string>("um.announcement.dismissed", "");

export function AnnouncementBar() {
  const s = useSiteSettings();
  const dismissed = useStore(dismissedStore);
  const hydrated = useHydrated();
  if (!hydrated || !s.announcementEnabled || !s.announcementText.trim() || dismissed === s.announcementText) return null;

  const text = <span>{s.announcementText}</span>;
  return (
    <div role="region" aria-label="Announcement" className="relative bg-gold text-navy">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center text-xs font-semibold tracking-wide sm:text-sm">
        {s.announcementLink ? (
          <Link href={s.announcementLink} className="underline-offset-4 hover:underline">{text}</Link>
        ) : text}
      </div>
      <button
        type="button"
        onClick={() => dismissedStore.set(s.announcementText)}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-navy/10"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
