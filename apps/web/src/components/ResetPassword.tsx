"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { backendOn, storeApi } from "@/lib/api";
import { btnPrimary, input, label } from "@/lib/ui";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
        <h1 className="mt-3 font-display text-4xl">Invalid link</h1>
        <p className="mt-4 text-mist">This password-reset link is missing or has expired. Please request a new one.</p>
        <Link href="/forgot-password" className={`${btnPrimary} mt-6 inline-flex`}>Request a new link</Link>
      </main>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 8) return setError("Choose a password of at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (!email.trim()) return setError("Please enter your email address.");

    setBusy(true);
    setError("");

    if (!backendOn) {
      setError("Password reset is not available without the backend. Please contact the store owner.");
      setBusy(false);
      return;
    }

    try {
      // Medusa v2: POST /auth/user/emailpass/reset-password?token=TOKEN with {email, password}
      await storeApi(`/auth/user/emailpass/reset-password?token=${encodeURIComponent(token)}`, {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again or request a new reset link.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
        <h1 className="mt-3 font-display text-4xl">Password updated</h1>
        <div role="status" className="mt-8 rounded-sm border border-gold/40 bg-navy-soft p-6">
          <p>Your password has been reset. You can now sign in with your new password.</p>
          <Link href="/admin/login" className={`${btnPrimary} mt-6 inline-flex`}>Go to admin sign-in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16 md:py-24">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Account</p>
      <h1 className="mt-3 font-display text-4xl">Set a new password</h1>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="rp-email" className={label}>Email</label>
          <input
            id="rp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={input}
          />
        </div>
        <div>
          <label htmlFor="rp-pass" className={label}>New password (8+ characters)</label>
          <input
            id="rp-pass"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className={input}
          />
        </div>
        <div>
          <label htmlFor="rp-confirm" className={label}>Confirm new password</label>
          <input
            id="rp-confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            className={input}
          />
        </div>
        {error && <p role="alert" className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {busy ? "Saving…" : "Save new password"}
        </button>
        <p className="text-center text-sm text-mist">
          <Link href="/forgot-password" className="text-gold underline-offset-4 hover:underline">Request a new reset link</Link>
        </p>
      </form>
    </main>
  );
}

export function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
