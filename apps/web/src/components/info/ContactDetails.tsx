"use client";

import { site, whatsappUrl } from "@/data/site";
import { useSiteSettings } from "@/lib/settings";

export function ContactDetails() {
  const s = useSiteSettings();
  const rows: { k: string; v: React.ReactNode }[] = [
    { k: "Call", v: <a href={site.phoneHref} className="hover:text-gold">{site.phoneDisplay}</a> },
    { k: "WhatsApp", v: <a href={whatsappUrl("Hello Urban Men, I have a question.")} className="hover:text-gold">Chat with us</a> },
    { k: "Instagram", v: <a href={site.instagramUrl} className="hover:text-gold">@{site.instagramHandle}</a> },
    { k: "Facebook", v: s.facebookUrl ? <a href={s.facebookUrl} className="hover:text-gold">{site.facebookName}</a> : site.facebookName },
  ];
  if (s.email) rows.push({ k: "Email", v: <a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a> });
  if (s.address) rows.push({ k: "Visit", v: s.address });
  if (s.hours) rows.push({ k: "Hours", v: s.hours });
  return (
    <dl className="space-y-5">
      {rows.map((r) => (
        <div key={r.k}>
          <dt className="text-xs uppercase tracking-[0.3em] text-mist">{r.k}</dt>
          <dd className="mt-1 text-lg">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
