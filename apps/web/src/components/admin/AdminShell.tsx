"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useCurrentUser } from "@/lib/stores";
import { kindPermission, notificationsStore } from "@/lib/notifications";
import { useStore } from "@/lib/storage";
import { adminNav, can, permissionForPath } from "@/lib/permissions";
import type { StaffRole } from "@/lib/types";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const myRole: StaffRole = user?.staffRole ?? "owner";
  const feed = useStore(notificationsStore);
  const unread = feed.filter((n) => !n.read && can(myRole, kindPermission[n.kind])).length;
  // a role without the dashboard (for example inventory) lands on its first allowed page
  useEffect(() => {
    if (user?.role === "admin" && path === "/admin" && !can(myRole, "dashboard")) {
      const first = adminNav.find((n) => can(myRole, n.perm));
      if (first) router.replace(first.href);
    }
  }, [user, myRole, path, router]);
  return (
    <RequireAuth role="admin">
      {(user) => {
        const role: StaffRole = user.staffRole ?? "owner";
        const needed = permissionForPath(path);
        const allowed = !needed || can(role, needed);
        return (
          <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gold">Admin · {role}</p>
                <h1 className="mt-3 font-display text-4xl md:text-5xl">Manage the shop</h1>
              </div>
              <div className="flex items-center gap-5">
                <Link href="/admin/notifications" aria-label={`Notifications, ${unread} new`} className="relative text-sm text-gold underline-offset-4 hover:underline">
                  Notifications
                  {unread > 0 && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-navy">{unread}</span>}
                </Link>
                <Link href="/shop" className="text-sm text-gold underline-offset-4 hover:underline">View the shop ↗</Link>
              </div>
            </div>
            <p className="mt-4 rounded-md border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-mist">
              Preview mode: changes are saved in this browser only and are not yet visible to other devices. Real admin accounts and shared data arrive with the backend.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
              <nav aria-label="Admin" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {adminNav.filter((i) => can(role, i.perm)).map((i) => {
                  const active = i.href === "/admin" ? path === i.href : path.startsWith(i.href);
                  return (
                    <Link
                      key={i.href}
                      href={i.href}
                      aria-current={active ? "page" : undefined}
                      className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-colors lg:rounded-md ${
                        active ? "bg-gold font-semibold text-navy" : "text-mist hover:bg-white/5 hover:text-ivory"
                      }`}
                    >
                      {i.label}
                    </Link>
                  );
                })}
              </nav>
              <section>
                {allowed ? (
                  children
                ) : (
                  <div className="rounded-sm border border-white/10 bg-navy-soft p-8">
                    <h2 className="font-display text-3xl">No access</h2>
                    <p className="mt-3 text-mist">Your role ({role}) cannot open this page. Ask the store owner if you need it.</p>
                    <Link href="/admin" className="mt-5 inline-block text-gold underline-offset-4 hover:underline">Back to the dashboard</Link>
                  </div>
                )}
              </section>
            </div>
          </main>
        );
      }}
    </RequireAuth>
  );
}
