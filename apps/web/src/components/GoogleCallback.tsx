"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { finishGoogle, takeNext } from "@/lib/account";
import { btnPrimary } from "@/lib/ui";

/** Where Google sends the customer back to: finish the sign-in with the backend, then go on to where they were. */
export function GoogleCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const [failed, setFailed] = useState("");
  const started = useRef(false); // the one-time code can only be used once (React strict mode runs effects twice in development)

  const early = params.get("error")
    ? "Google sign-in was cancelled. You can try again, or check out as a guest."
    : !params.get("code")
      ? "This page is where Google sends you back after you sign in. Start from the Sign in page."
      : "";
  const error = early || failed;

  useEffect(() => {
    if (early || started.current) return;
    started.current = true;
    finishGoogle(`?${params.toString()}`).then((r) => {
      if (r.ok) router.replace(takeNext());
      else setFailed(r.error);
    });
  }, [early, params, router]);

  return (
    <main className="mx-auto max-w-md px-5 py-24 text-center">
      {error ? (
        <>
          <h1 className="font-display text-3xl">We could not sign you in</h1>
          <p role="alert" className="mt-4 text-mist">{error}</p>
          <Link href="/login" className={`${btnPrimary} mt-8`}>Back to sign in</Link>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl">Signing you in…</h1>
          <p className="mt-4 text-mist">One moment while we finish with Google.</p>
        </>
      )}
    </main>
  );
}
