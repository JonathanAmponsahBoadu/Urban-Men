"use client";

import { useState } from "react";
import { useStore } from "@/lib/storage";
import { requestStockAlert, usersStore } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import type { Size } from "@/lib/types";
import { btnOutline, input } from "@/lib/ui";

/** Share the page using the phone's share sheet, or copy the link. */
export function ShareButton({ title }: { title: string }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      /* the visitor closed the share sheet */
    }
  };
  return (
    <button type="button" onClick={share} className="flex items-center gap-2 text-sm text-mist hover:text-gold">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
      </svg>
      Share
    </button>
  );
}

/** "Tell me when this is back": saves a phone/email request for the shop to follow up. */
export function StockAlert({ slug, size, userId }: { slug: string; size?: Size; userId?: string }) {
  const users = useStore(usersStore);
  const user = users.find((u) => u.id === userId);
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) return <p role="status" className="mt-4 rounded-md bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">Thanks, we will let you know when it is back.</p>;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const c = (contact || user?.phone || user?.email || "").trim();
        if (c.length < 5) return showToast("Add a phone number or email first");
        requestStockAlert(slug, size, c);
        setSent(true);
      }}
      className="mt-4 rounded-md border border-white/15 p-4"
    >
      <p className="text-sm font-semibold">Sold out{size ? ` in size ${size}` : ""}? Tell me when it is back.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="alert-contact" className="sr-only">Phone or email</label>
        <input id="alert-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={user?.phone ?? user?.email ?? "Phone or email"} className={input} />
        <button type="submit" className={`${btnOutline} shrink-0 py-2`}>Notify me</button>
      </div>
    </form>
  );
}
