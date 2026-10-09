"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/lib/storage";
import { useCurrentUser } from "@/lib/stores";
import type { Role, User } from "@/lib/types";
import { btnOutline, btnPrimary } from "@/lib/ui";

/** Renders children only for a signed-in user (optionally with a role). UI gate only: not real security. */
export function RequireAuth({ role, children }: { role?: Role; children: (user: User) => React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const path = usePathname();

  if (!hydrated) return <p className="py-24 text-center text-mist">Loading…</p>;

  if (!user && role === "admin") {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Admin sign-in required</h1>
        <p className="mt-3 text-mist">Please sign in with your admin email and password.</p>
        <Link href={`/admin/login?next=${encodeURIComponent(path)}`} className={`${btnPrimary} mt-8`}>Admin sign-in</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Sign in to continue</h1>
        <p className="mt-3 text-mist">You need an account to see this page.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/login?next=${encodeURIComponent(path)}`} className={btnPrimary}>Sign in</Link>
          <Link href={`/signup?next=${encodeURIComponent(path)}`} className={btnOutline}>Sign up</Link>
        </div>
      </div>
    );
  }

  if (role && user.role !== role) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Admins only</h1>
        <p className="mt-3 text-mist">Your account does not have access to this area.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={`/admin/login?next=${encodeURIComponent(path)}`} className={btnPrimary}>Admin sign-in</Link>
          <Link href="/" className={btnOutline}>Back home</Link>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}
