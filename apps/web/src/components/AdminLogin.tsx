"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useHydrated } from "@/lib/storage";
import { signInAnyAdmin, signOut, useCurrentUser } from "@/lib/stores";
import { btnGhost, btnPrimary, input, label } from "@/lib/ui";

// only allow same-site relative redirects inside the admin area
function safeNext(raw: string | null) {
  return raw && raw.startsWith("/admin") && !raw.startsWith("//") ? raw : "/admin";
}

export function AdminLogin() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const result = await signInAnyAdmin(String(f.get("email") ?? ""), String(f.get("password") ?? ""));
    if (!result.ok) return setError(result.error);
    router.push(next);
  };

  return (
    <main className="mx-auto max-w-md px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Staff</p>
      <h1 className="mt-3 font-display text-4xl">Admin sign-in</h1>
      <p className="mt-3 text-mist">Sign in to manage products, stock, orders and style requests.</p>

      {hydrated && user?.role === "admin" ? (
        <div className="mt-8 rounded-sm border border-gold/40 bg-navy-soft p-6">
          <p>You are signed in as <span className="font-semibold">{user.email}</span>.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={next} className={btnPrimary}>Open the admin</Link>
            <button type="button" className={btnGhost} onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="a-email" className={label}>Admin email</label>
            <input id="a-email" name="email" type="email" required autoComplete="username" className={input} />
          </div>
          <div>
            <label htmlFor="a-password" className={label}>Password</label>
            <input id="a-password" name="password" type="password" required autoComplete="current-password" className={input} />
          </div>
          {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
          <button type="submit" className={`${btnPrimary} w-full`}>Sign in</button>
        </form>
      )}

      <aside className="mt-10 rounded-md border border-gold/30 bg-gold/5 p-4 text-sm text-mist">
        <p className="font-semibold text-gold">Preview mode</p>
        <p className="mt-1">
          This sign-in is a temporary stand-in and is not secure. It is replaced by real accounts and roles when the backend is connected.
        </p>
      </aside>
      <p className="mt-6 text-center text-sm text-mist">
        Not staff? <Link href="/login" className="text-gold underline-offset-4 hover:underline">Customer sign-in</Link>
      </p>
    </main>
  );
}
