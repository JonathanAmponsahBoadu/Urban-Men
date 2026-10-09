import type { ReactNode } from "react";
import { DraftNotice } from "@/components/info/DraftNotice";

/** Shared layout for text pages (about, FAQ, policies). */
export function InfoPage({
  eyebrow,
  title,
  intro,
  draft = false,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  draft?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">{title}</h1>
      {intro && <p className="mt-5 max-w-2xl text-lg text-mist">{intro}</p>}
      {draft && <DraftNotice />}
      <div className="mt-12 space-y-12">{children}</div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl md:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-lg leading-relaxed text-mist">{children}</div>
    </section>
  );
}
