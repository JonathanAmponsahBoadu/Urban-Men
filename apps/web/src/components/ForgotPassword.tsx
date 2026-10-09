"use client";

import Link from "next/link";
import { useState } from "react";
import { btnPrimary, input, label } from "@/lib/ui";

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setSent(true);
          }}
          className="mt-8 space-y-5"
        >
          <p className="text-mist">Enter your email and we will send you a link to reset it.</p>
          <div>
            <label htmlFor="fp-email" className={label}>Email</label>
            <input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
          </div>
          <button type="submit" className={`${btnPrimary} w-full`}>Send reset link</button>
          <p className="text-center text-sm text-mist">
            Remembered it? <Link href="/login" className="text-gold underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </form>
      )}

      <aside className="mt-10 rounded-md border border-gold/30 bg-gold/5 p-4 text-sm text-mist">
        <p className="font-semibold text-gold">Preview mode</p>
        <p className="mt-1">No email is sent yet. Password reset works once accounts and email are connected.</p>
      </aside>
    </main>
  );
}
