"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useStore } from "@/lib/storage";
import { inboxStore } from "@/lib/stores";

const items = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/inbox", label: "Inbox" },
  { href: "/account/reviews", label: "Ratings & reviews" },
  { href: "/account/requests", label: "Style requests" },
  { href: "/account/addresses", label: "Addresses & MoMo" },
  { href: "/account/measurements", label: "My measurements" },
  { href: "/account/vouchers", label: "Vouchers" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const inbox = useStore(inboxStore);

  return (
    <RequireAuth>
      {(user) => {
        const unread = inbox.filter((m) => m.userId === user.id && !m.read).length;
        return (
          <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">My account</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">Hello, {user.name.split(" ")[0]}</h1>

            <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr]">
              <nav aria-label="Account" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {items.map((i) => {
                  const active = i.href === "/account" ? path === i.href : path.startsWith(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-colors lg:rounded-md ${
                        active ? "bg-gold font-semibold text-navy" : "text-mist hover:bg-white/5 hover:text-ivory"
                      }`}
                    >
                      {i.label}
                      {i.href === "/account/inbox" && unread > 0 && (
                        <span className={`rounded-full px-2 text-xs font-bold ${active ? "bg-navy text-gold" : "bg-gold text-navy"}`}>{unread}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <section aria-live="polite">{children}</section>
            </div>
          </main>
        );
      }}
    </RequireAuth>
  );
}
