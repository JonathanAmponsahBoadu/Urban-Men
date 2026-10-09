"use client";

import Image from "next/image";
import { useState } from "react";
import { useProducts } from "@/components/CatalogueProvider";
import { defaultSettings, saveSettings, useSiteSettings, type SiteSettings } from "@/lib/settings";
import { logActivity, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { btnGhost, btnPrimary, card, input, label } from "@/lib/ui";

const MAX_SLIDES = 6;

export function SettingsAdmin() {
  const user = useCurrentUser();
  const current = useSiteSettings();
  const shirts = useProducts();
  const [d, setD] = useState<SiteSettings>(current);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setD((cur) => ({ ...cur, [k]: v }));

  const toggleSlide = (slug: string) =>
    set("heroSlugs", d.heroSlugs.includes(slug) ? d.heroSlugs.filter((s) => s !== slug) : d.heroSlugs.length >= MAX_SLIDES ? d.heroSlugs : [...d.heroSlugs, slug]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({ ...d, returnWindowDays: Math.max(0, Math.round(Number(d.returnWindowDays) || 0)), facebookUrl: d.facebookUrl.trim(), email: d.email.trim(), address: d.address.trim(), hours: d.hours.trim() });
    logActivity(user?.name ?? "Admin", "updated the homepage and store settings");
    showToast("Settings saved");
  };

  return (
    <form onSubmit={save} className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl">Homepage &amp; settings</h2>
        <button type="button" className={btnGhost} onClick={() => setD(defaultSettings)}>Reset to defaults</button>
      </div>

      <fieldset className={`${card} space-y-5 p-5`}>
        <legend className="px-2 text-xs uppercase tracking-[0.3em] text-gold">Announcement bar</legend>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={d.announcementEnabled} onChange={(e) => set("announcementEnabled", e.target.checked)} className="h-5 w-5 accent-gold" /> Show the bar at the top of every page
        </label>
        <div>
          <label htmlFor="s-ann" className={label}>Message</label>
          <input id="s-ann" value={d.announcementText} onChange={(e) => set("announcementText", e.target.value)} className={input} maxLength={140} />
        </div>
        <div>
          <label htmlFor="s-annlink" className={label}>Link (optional, e.g. /shop)</label>
          <input id="s-annlink" value={d.announcementLink} onChange={(e) => set("announcementLink", e.target.value)} className={input} />
        </div>
      </fieldset>

      <fieldset className={`${card} p-5`}>
        <legend className="px-2 text-xs uppercase tracking-[0.3em] text-gold">Homepage slideshow</legend>
        <p className="text-sm text-mist">Choose up to {MAX_SLIDES} shirts. They show in the order you pick them ({d.heroSlugs.length} chosen).</p>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {shirts.map((p) => {
            const idx = d.heroSlugs.indexOf(p.slug);
            const on = idx >= 0;
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  onClick={() => toggleSlide(p.slug)}
                  aria-pressed={on}
                  aria-label={`${p.name}${on ? `, slide ${idx + 1}` : ""}`}
                  className={`relative block aspect-4/5 w-full overflow-hidden rounded-sm ${on ? "ring-2 ring-gold" : "opacity-60 ring-1 ring-white/20 hover:opacity-100"}`}
                >
                  <Image src={p.images[0].src} alt="" fill sizes="120px" className="object-cover" />
                  {on && <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{idx + 1}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className={`${card} grid gap-5 p-5 sm:grid-cols-2`}>
        <legend className="px-2 text-xs uppercase tracking-[0.3em] text-gold">Contact details</legend>
        <div><label htmlFor="s-fb" className={label}>Facebook page link</label><input id="s-fb" value={d.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/…" className={input} /></div>
        <div><label htmlFor="s-email" className={label}>Email</label><input id="s-email" type="email" value={d.email} onChange={(e) => set("email", e.target.value)} className={input} /></div>
        <div><label htmlFor="s-addr" className={label}>Shop address</label><input id="s-addr" value={d.address} onChange={(e) => set("address", e.target.value)} className={input} /></div>
        <div><label htmlFor="s-hours" className={label}>Opening hours</label><input id="s-hours" value={d.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Mon to Sat, 9am to 6pm" className={input} /></div>
        <p className="text-sm text-mist sm:col-span-2">Anything you fill in appears in the footer and on the contact page.</p>
      </fieldset>

      <fieldset className={`${card} space-y-5 p-5`}>
        <legend className="px-2 text-xs uppercase tracking-[0.3em] text-gold">Policies</legend>
        <div className="max-w-xs">
          <label htmlFor="s-ret" className={label}>Return window (days)</label>
          <input id="s-ret" type="number" min={0} value={d.returnWindowDays} onChange={(e) => set("returnWindowDays", Number(e.target.value))} className={input} />
        </div>
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={d.policiesDraft} onChange={(e) => set("policiesDraft", e.target.checked)} className="mt-1 h-5 w-5 accent-gold" />
          <span>
            Show the “draft, under review” notice on the FAQ, delivery &amp; returns, privacy and terms pages
            <span className="block text-sm text-mist">Turn this off once you have read the wording and are happy with it.</span>
          </span>
        </label>
      </fieldset>

      <button type="submit" className={btnPrimary}>Save settings</button>
    </form>
  );
}
