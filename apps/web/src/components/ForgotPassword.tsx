"use client";

import Link from "next/link";
import { useState } from "react";
import { backendOn, storeApi } from "@/lib/api";
import { btnPrimary, input, label } from "@/lib/ui";

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const addr = email.trim();
    if (!addr) return;

    if (backendOn) {
      setBusy(true);
      setError("");
      try {
        // Medusa v2: request a password-reset email for a staff/admin user
        await storeApi("/auth/user/emailpass/reset-password", {
          method: "POST",
          body: { identifier: addr },
        });
      } catch {
        // Always show the same "check your email" message so we don't leak whether the account exists
      } finally {
        setBusy(false);
      }
    }

    setSent(true);
  };

  return (
    <main className="mx-auto max-w-md px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
      <h1 className="mt-3 font-display text-4xl">Forgot your password?</h1>

      {sent ? (
        <div role="status" className="mt-8 rounded-sm border border-gold/40 bg-navy-soft p-6">
          <p className="font-semibold">Check your email</p>
          <p className="mt-2 text-mist">If an account exists for <span className="text-ivory">{email}</span>, we will send a link to set a new password.</p>
          <Link href="/login" className={`${btnPrimary} mt-6`}>Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5">
          <p className="text-mist">Enter your email and we will send you a link to reset it.</p>
          <div>
            <label htmlFor="fp-email" className={label}>Email</label>
            <input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
          </div>
          {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>{busy ? "Sending…" : "Send reset link"}</button>
          <p className="text-center text-sm text-mist">
            Remembered it? <Link href="/login" className="text-gold underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </form>
      )}
    </main>
  );
}

