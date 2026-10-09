import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info/InfoPage";
import { ReturnWindow } from "@/components/info/ReturnWindow";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about ordering, sizes, matching trousers, custom styles, delivery and returns.",
};

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do I order?",
    a: (
      <>
        Pick a shirt, choose your size, add it to your cart and go to checkout. You can also message us on WhatsApp with the shirt you like and we will take your order there.
      </>
    ),
  },
  {
    q: "How do I pay?",
    a: <>At checkout you can pay with Mobile Money (MTN MoMo, Telecel Cash or AT Money).</>,
  },
  {
    q: "Do the shirts come with matching trousers?",
    a: <>Yes. Every shirt comes with matching trousers, cut from the same cloth, so you get a complete set. If a particular shirt is sold without them, its product page says so.</>,
  },
  {
    q: "How do I find my size?",
    a: (
      <>
        Use our <Link href="/size-guide" className="text-gold underline-offset-4 hover:underline">size guide</Link> and compare your measurements to the chart. If you are between sizes, choose the larger one for a relaxed fit.
      </>
    ),
  },
  {
    q: "Can you make a style I design or saw somewhere?",
    a: (
      <>
        Yes, send us a <Link href="/custom-style" className="text-gold underline-offset-4 hover:underline">custom style request</Link> with a description and photos. We reply with what is possible and a price.
      </>
    ),
  },
  {
    q: "How much is delivery and how long does it take?",
    a: <>It depends on where you are. We confirm the delivery cost and time with you when your order is placed.</>,
  },
  {
    q: "Can I return or exchange something?",
    a: (
      <>
        You can ask for a return or exchange within <ReturnWindow /> of receiving your order. See our <Link href="/delivery-returns" className="text-gold underline-offset-4 hover:underline">delivery &amp; returns</Link> page for details.
      </>
    ),
  },
  {
    q: "How can I track my order?",
    a: (
      <>
        Sign in and open Orders in your account, or use <Link href="/track" className="text-gold underline-offset-4 hover:underline">Track your order</Link> with your order number and phone number.
      </>
    ),
  },
  {
    q: "How do I contact you?",
    a: (
      <>
        Call or WhatsApp 055 009 5440, message us on Instagram, or use the <Link href="/contact" className="text-gold underline-offset-4 hover:underline">contact page</Link>.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <InfoPage eyebrow="Help" title="Frequently asked questions" intro="Quick answers to the things people ask us most." draft>
      <div className="divide-y divide-white/10 border-y border-white/10">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl marker:hidden [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-2xl text-gold transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-mist">{f.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
