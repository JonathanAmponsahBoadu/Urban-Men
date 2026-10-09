import type { Metadata } from "next";
import Link from "next/link";
import { FindMySize } from "@/components/FindMySize";
import { SizeChart } from "@/components/SizeChart";
import { measuringTips } from "@/data/sizing";
import { btnOutline, btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Find your Urban Men size: garment measurements and how to measure yourself.",
};

export default function SizeGuidePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Size guide</p>
      <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">Find your fit</h1>
      <p className="mt-4 max-w-2xl text-lg text-mist">
        Compare your measurements to the chart below. If you are between sizes, choose the larger one for a relaxed fit.
      </p>

      <section className="mt-12" aria-labelledby="find">
        <h2 id="find" className="mb-4 font-display text-2xl">Find my size</h2>
        <FindMySize />
      </section>

      <section className="mt-16" aria-labelledby="chart">
        <h2 id="chart" className="mb-4 font-display text-2xl">Shirt measurements</h2>
        <SizeChart />
      </section>

      <section className="mt-16" aria-labelledby="how">
        <h2 id="how" className="mb-6 font-display text-2xl">How to measure</h2>
        <dl className="grid gap-6 sm:grid-cols-2">
          {measuringTips.map((t) => (
            <div key={t.part} className="rounded-sm border border-white/10 bg-navy-soft p-5">
              <dt className="font-semibold text-gold">{t.part}</dt>
              <dd className="mt-1 text-mist">{t.how}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link href="/shop" className={btnPrimary}>Shop shirts</Link>
        <Link href="/custom-style" className={btnOutline}>Need a custom fit?</Link>
      </div>
    </main>
  );
}
