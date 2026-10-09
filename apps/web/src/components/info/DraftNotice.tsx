"use client";

import { useSiteSettings } from "@/lib/settings";

/** Shown on policy pages until the admin turns off "policies are draft" in settings. */
export function DraftNotice() {
  const { policiesDraft } = useSiteSettings();
  if (!policiesDraft) return null;
  return (
    <p role="note" className="mt-6 rounded-md border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
      <span className="font-semibold">Draft:</span> this page is being reviewed and may change before launch. It is not legal advice.
    </p>
  );
}
