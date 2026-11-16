"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GoogleButton } from "@/components/GoogleButton";
import { loginAccount, registerAccount } from "@/lib/account";
import { backendOn, warmBackend } from "@/lib/api";
import { signIn, signUp } from "@/lib/stores";
import { btnPrimary, input, label } from "@/lib/ui";

// only allow same-site relative redirects
function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";
  useEffect(warmBackend, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    const password = String(f.get("password") ?? "");
    if (password.length < 8) return setError("Use a password of at least 8 characters.");
    setError("");
    let result;
    if (backendOn) {
      setBusy(true);
      result = isSignup
        ? await registerAccount({ name: String(f.get("name") ?? ""), email, phone: String(f.get("phone") ?? ""), password })
        : await loginAccount(email, password);
      setBusy(false);
    } else {
      result = isSignup ? signUp({ name: String(f.get("name") ?? ""), email, phone: String(f.get("phone") ?? "") }) : await signIn(email, password);
    }
    if (!result.ok) return setError(result.error);
    router.push(next);
  };

  return (
    <main className="mx-auto max-w-md px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">{isSignup ? "Join us" : "Welcome back"}</p>
      <h1 className="mt-3 font-display text-4xl">{isSignup ? "Create your account" : "Sign in"}</h1>
      <p className="mt-3 text-mist">
        {isSignup ? "Optional: an account links your Gmail to track orders, save favourites and leave reviews. You can always check out as a guest." : "Pick up where you left off."}
      </p>

      <div className="mt-8">
        <GoogleButton next={next} onDone={() => router.push(next)} />
        <p className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-mist">
          <span className="h-px flex-1 bg-white/15" /> or with email <span className="h-px flex-1 bg-white/15" />
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {isSignup && (
          <div>
            <label htmlFor="name" className={label}>Full name</label>
            <input id="name" name="name" required autoComplete="name" className={input} />
          </div>
        )}
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={input} />
        </div>
        {isSignup && (
          <div>
            <label htmlFor="phone" className={label}>Phone (for delivery)</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="055 000 0000" className={input} />
          </div>
        )}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs uppercase tracking-[0.25em] text-mist">Password</label>
            {!isSignup && <Link href="/forgot-password" className="text-xs text-gold underline-offset-4 hover:underline">Forgot password?</Link>}
          </div>
          <div className="relative">
            <input id="password" name="password" type={show ? "text" : "password"} required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"} className={`${input} pr-20`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-pressed={show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1 text-xs text-gold hover:bg-white/5">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-60`}>
          {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={`${isSignup ? "/login" : "/signup"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-gold underline-offset-4 hover:underline">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>

      {!backendOn && (
        <aside className="mt-10 rounded-md border border-gold/30 bg-gold/5 p-4 text-sm text-mist">
          <p className="font-semibold text-gold">Preview mode</p>
          <p className="mt-1">
            Accounts and privileges are managed right here. Sign in with any customer or staff email to explore.
          </p>
        </aside>
      )}
    </main>
  );
}
