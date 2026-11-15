"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { site, whatsappUrl } from "@/data/site";
import { useSiteSettings } from "@/lib/settings";
import { subscribeEmail } from "@/lib/stores";
import { MOMO_NETWORKS } from "@/lib/types";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All shirts" },
      { href: "/shop?sleeve=Long%20sleeve", label: "Long sleeve" },
      { href: "/shop?sleeve=Short%20sleeve", label: "Short sleeve" },
      { href: "/pre-order", label: "Pre-order" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/custom-style", label: "Custom style" },
      { href: "/corporate", label: "Corporate orders" },
      { href: "/size-guide", label: "Size guide" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/delivery-returns", label: "Delivery & returns" },
      { href: "/track", label: "Track your order" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Urban Men" },
      { href: "/#app", label: "Get the app" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];

function Newsletter() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const r = subscribeEmail(email);
        if (!r.ok) return setMsg({ ok: false, text: r.error });
        setMsg({ ok: true, text: r.already ? "You are already on the list." : "Thank you, you are on the list." });
        setEmail("");
      }}
      className="mt-4"
    >
      <label htmlFor="news-email" className="sr-only">Email address</label>
      <div className="flex gap-2">
        <input
          id="news-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full min-w-0 rounded-full border border-white/15 bg-navy px-4 py-2.5 text-sm text-ivory placeholder:text-mist/70 focus:border-gold focus:outline-none"
        />
        <button type="submit" className="shrink-0 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-deep">Join</button>
      </div>
      <p role="status" className={`mt-2 min-h-5 text-xs ${msg?.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{msg?.text}</p>
    </form>
  );
}

export function SiteFooter() {
  const s = useSiteSettings();
  return (
    <footer data-theme="dark" className="border-t border-white/10 bg-navy-deep pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)_1.4fr]">
          <div>
            <Logo variant="wordmark" className="h-24" />
            <p className="mt-4 max-w-xs text-sm text-mist">Premium African-print shirts from Ghana. {site.tagline}</p>
            <ul className="mt-5 space-y-2 text-sm">
              <li><a href={site.phoneHref} className="hover:text-gold">{site.phoneDisplay}</a></li>
              <li><a href={whatsappUrl("Hello Urban Men, I have a question.")} className="hover:text-gold">WhatsApp us</a></li>
              <li><a href={site.instagramUrl} className="hover:text-gold">Instagram @{site.instagramHandle}</a></li>
              <li>
                {s.facebookUrl ? <a href={s.facebookUrl} className="hover:text-gold">Facebook {site.facebookName}</a> : <span>Facebook {site.facebookName}</span>}
              </li>
              {s.email && <li><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>}
              {s.address && <li className="text-mist">{s.address}</li>}
              {s.hours && <li className="text-mist">{s.hours}</li>}
            </ul>
          </div>

          {columns.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">{c.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-mist hover:text-gold">{l.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Stay in the loop</p>
            <p className="mt-4 text-sm text-mist">New styles and offers, straight to your inbox.</p>
            <Newsletter />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2 text-xs text-mist">
            <span className="mr-1 uppercase tracking-[0.25em]">We accept</span>
            {MOMO_NETWORKS.map((n) => (
              <span key={n} className="rounded-md border border-white/15 px-2.5 py-1">{n}</span>
            ))}
          </div>
          <p className="text-xs text-mist">
            © {new Date().getFullYear()} {site.name} · Ghana ·{" "}
            <Link href="/admin/login" className="text-mist/70 underline-offset-4 hover:text-gold hover:underline">Staff sign-in</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
