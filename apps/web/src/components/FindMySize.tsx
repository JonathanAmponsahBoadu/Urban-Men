"use client";

import Link from "next/link";
import { useState } from "react";
import { recommendSize } from "@/data/sizing";
import { useCurrentUser } from "@/lib/stores";
import { input, label } from "@/lib/ui";

/** Type your chest measurement and get a suggested size. */
export function FindMySize() {
  const user = useCurrentUser();
  const [typed, setTyped] = useState<string | undefined>();
  const value = typed ?? (user?.measurements?.chest ? String(user.measurements.chest) : "");
  const size = recommendSize(Number(value) || undefined);
  return (
    <div className="rounded-sm border border-white/10 bg-navy-soft p-6">
      <label htmlFor="fms-chest" className={label}>Your chest measurement (cm)</label>
      <div className="flex flex-wrap items-center gap-4">
        <input id="fms-chest" type="number" min={60} max={200} value={value} onChange={(e) => setTyped(e.target.value)} placeholder="e.g. 98" className={`${input} max-w-40`} />
        <p aria-live="polite" className="text-lg">
          {size ? <>We suggest size <span className="font-semibold text-gold">{size}</span></> : <span className="text-mist">Enter your chest measurement to see a suggestion.</span>}
        </p>
      </div>
      <p className="mt-4 text-sm text-mist">
        {user ? <>Save all your measurements under <Link href="/account/measurements" className="text-gold underline-offset-4 hover:underline">My measurements</Link> and we will suggest a size on every shirt.</> : <><Link href="/login?next=/account/measurements" className="text-gold underline-offset-4 hover:underline">Sign in</Link> to save your measurements and see a suggested size on every shirt.</>}
      </p>
    </div>
  );
}
