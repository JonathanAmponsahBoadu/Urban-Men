import type { Metadata } from "next";
import { ContactDetails } from "@/components/info/ContactDetails";
import { CorporateForm } from "@/components/info/CorporateForm";

export const metadata: Metadata = {
  title: "Corporate orders",
  description: "Staff attire in African print: order Urban Men shirts for your team, church, event or company.",
};

const points = [
  { title: "Staff and team attire", text: "A shared look for your team, with the same print and cut in every size." },
  { title: "Traditional Fridays and events", text: "Matching shirts for corporate events, weddings and church groups." },
  { title: "Made in quantity", text: "Tell us how many pieces you need and when. We reply with options and a quote." },
];

export default function CorporatePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Corporate orders</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
        One look for <em className="text-gold">the whole team.</em>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-mist">
        Dressing a company, a church group or a wedding party? Tell us what you need and we will come back with designs, timing and a quote.
      </p>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {points.map((p) => (
          <li key={p.title} className="rounded-sm border border-white/10 bg-navy-soft p-5">
            <p className="font-display text-xl text-gold">{p.title}</p>
            <p className="mt-1 text-base text-mist">{p.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_20rem]">
        <CorporateForm />
        <aside>
          <ContactDetails />
        </aside>
      </div>
    </main>
  );
}
