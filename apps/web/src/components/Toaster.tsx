"use client";

import Link from "next/link";
import { useStore } from "@/lib/storage";
import { toastStore } from "@/lib/toast";

export function Toaster() {
  const toasts = useStore(toastStore);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-70 flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-4 rounded-full border border-gold/40 bg-navy-soft px-5 py-3 text-sm shadow-xl"
        >
          <span>{t.text}</span>
          {t.href && (
            <Link href={t.href} className="font-semibold text-gold underline-offset-4 hover:underline">
              {t.linkLabel}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
