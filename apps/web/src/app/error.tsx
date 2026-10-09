"use client";

import Link from "next/link";
import { btnOutline, btnPrimary } from "@/lib/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Something went wrong</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">Sorry, that did not work.</h1>
      <p className="mt-4 text-lg text-mist">Please try again. If it keeps happening, message us on WhatsApp.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className={btnPrimary}>Try again</button>
        <Link href="/" className={btnOutline}>Back home</Link>
      </div>
    </main>
  );
}
