"use client";

import Link from "next/link";
import { createStore, useHydrated, useStore } from "@/lib/storage";
import { btnPrimary } from "@/lib/ui";

const consentStore = createStore<boolean>("um.consent", false);

/** Plain notice about the browser storage the site uses. No tracking cookies are set. */
export function ConsentBanner() {
  const hydrated = useHydrated();
  const accepted = useStore(consentStore);
  if (!hydrated || accepted) return null;
  return (
    <div role="region" aria-label="Storage notice" className="fixed bottom-20 left-3 right-3 z-59 mx-auto max-w-xl rounded-md border border-white/15 bg-navy-soft p-4 shadow-2xl md:bottom-4 md:left-4 md:right-auto md:mx-0">
      <p className="text-sm text-mist">
        We store your cart, wishlist and sign-in in your browser so the shop works. See our{" "}
        <Link href="/privacy" className="text-gold underline-offset-4 hover:underline">privacy policy</Link>.
      </p>
      <button type="button" onClick={() => consentStore.set(true)} className={`${btnPrimary} mt-3 px-5 py-2`}>
        Got it
      </button>
    </div>
  );
}
