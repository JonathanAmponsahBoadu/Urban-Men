"use client";

import { useState } from "react";
import { startGoogle } from "@/lib/account";
import { backendOn } from "@/lib/api";
import { signInWithGoogle } from "@/lib/stores";
import { btnGhost, input, label } from "@/lib/ui";

const GoogleG = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

/**
 * "Continue with Google" for sign-up and log-in. With the backend connected it opens Google's own consent screen;
 * Google then returns to /auth/google/callback. Without a backend (demo) it asks for the Gmail address instead.
 * Shoppers never have to sign in to buy.
 */
export function GoogleButton({ onDone, next = "/account" }: { onDone: () => void; next?: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const click = async () => {
    if (!backendOn) return setOpen((v) => !v);
    setError("");
    setBusy(true);
    const r = await startGoogle(next);
    if (!r.ok) {
      setBusy(false);
      setError(r.error);
    }
  };

  return (
    <div>
      <button type="button" onClick={click} disabled={busy} aria-expanded={backendOn ? undefined : open} className={`${btnGhost} w-full gap-3 py-3 disabled:opacity-60`}>
        <GoogleG /> {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      {backendOn && error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
      {!backendOn && open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = String(new FormData(e.currentTarget).get("gmail") ?? "");
            const r = signInWithGoogle({ email });
            if (!r.ok) return setError(r.error);
            onDone();
          }}
          className="mt-3 space-y-3 rounded-md border border-white/15 bg-navy-soft p-4"
        >
          <div>
            <label htmlFor="gmail" className={label}>Your Gmail address</label>
            <input id="gmail" name="gmail" type="email" required autoComplete="email" placeholder="you@gmail.com" className={input} />
          </div>
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
          <button type="submit" className={`${btnGhost} w-full`}>Continue</button>
          <p className="text-xs text-mist">Preview: the real Google screen appears here once the shop&apos;s backend is connected.</p>
        </form>
      )}
    </div>
  );
}
