"use client";

import Link from "next/link";
import { useProducts } from "@/components/CatalogueProvider";
import { ProductCard } from "@/components/ProductCard";
import { whatsappUrl } from "@/data/site";
import { isPreorder } from "@/lib/format";
import { useSiteSettings } from "@/lib/settings";
import { btnOutline, btnPrimary } from "@/lib/ui";

export function PreorderView() {
  const products = useProducts().filter(isPreorder);
  const { preorderDepositPercent: pct } = useSiteSettings();
  const full = pct >= 100;

  const steps = [
    { title: "Choose your design", text: "Pick a pre-order design below, then your shirt size. Matching trousers come with it unless the design says shirt only." },
    { title: full ? "Pay online" : `Pay ${pct}% to reserve it`, text: full ? "Pay the full amount with Mobile Money at checkout." : `Pay a ${pct}% deposit with Mobile Money at checkout. The rest is paid before delivery.` },
    { title: "We make it for you", text: "Your pieces are made after you order. Each design shows when it is expected, and we keep you posted by WhatsApp, SMS or email." },
    { title: full ? "We deliver" : "Pay the balance, we deliver", text: full ? "When it is ready we deliver to your door." : "When it is ready we ask for the balance, then deliver to your door." },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 md:px-10 md:pt-12">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Pre-order</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
        Be the first to wear it. <em className="text-gold">Reserve yours.</em>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-mist">
        These designs are made after you order, so you get yours fresh from the tailor, in your size.
      </p>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="How pre-ordering works">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-white/10 bg-navy-soft p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-bold text-navy">{i + 1}</span>
            <h2 className="mt-4 font-display text-xl">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">{s.text}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-16 font-display text-3xl md:text-4xl">Open for pre-order</h2>
      {products.length > 0 ? (
        <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-white/10 p-10 text-center">
          <p className="font-display text-2xl">Nothing is open for pre-order right now.</p>
          <p className="mt-2 text-mist">New designs are announced on Instagram and WhatsApp. You can also ask for something made just for you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/custom-style" className={btnPrimary}>Request a custom style</Link>
            <Link href="/shop" className={btnOutline}>Shop what is ready now</Link>
          </div>
        </div>
      )}

      <p className="mt-14 text-center text-mist">
        Questions about a pre-order?{" "}
        <a href={whatsappUrl("Hello Urban Men, I have a question about pre-ordering.")} className="text-gold underline-offset-4 hover:underline">Ask us on WhatsApp</a>.
      </p>
    </main>
  );
}
