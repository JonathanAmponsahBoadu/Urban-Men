import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info/InfoPage";
import { btnOutline, btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "About us",
  description: "Urban Men Apparel makes premium African-print menswear in Ghana: professional, timeless and authentic.",
};

const values = [
  { title: "Luxury", text: "Finishing and detail you can see and feel." },
  { title: "Premium fabric", text: "Quality cloth and authentic African prints." },
  { title: "Classy", text: "Understated colour-blocking for formal occasions." },
  { title: "Impeccable fit", text: "Clean, tailored cuts that sit right." },
  { title: "Unmatched style", text: "Signature looks you will not find on the rack." },
];

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title={
        <>
          Professional. Timeless. <em className="text-gold">Authentic.</em>
        </>
      }
      intro="Urban Men Apparel is a Ghanaian menswear brand built around one idea: African print, worn the way a professional wears a good shirt."
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-navy-soft">
        <Image
          src="/images/products/navy-kente-yoke-shirt.jpg"
          alt="A man in an Urban Men navy shirt with a kente yoke"
          fill
          sizes="(min-width: 1024px) 56rem, 95vw"
          className="object-cover object-top"
        />
      </div>

      <Section title="What we make">
        <p>
          Our Signature Collections pair a clean, solid shirt with panels of authentic African print: kente, Ankara and adinkra-inspired cloth, placed as a pocket, a yoke, a band or a side panel.
          The result is a shirt that works in the office, at church, at a wedding and everywhere in between.
        </p>
        <p>Every shirt comes with matching trousers, cut from the same cloth, for a complete official look, unless its details say otherwise.</p>
      </Section>

      <Section title="What we stand for">
        <ul className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <li key={v.title} className="rounded-sm border border-white/10 bg-navy-soft p-5">
              <p className="font-display text-xl text-gold">{v.title}</p>
              <p className="mt-1 text-base">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Made for you">
        <p>Cannot find the exact shirt you imagined? Tell us the style, add a photo, and we will reply with what is possible and a price.</p>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className={btnPrimary}>Shop apparels</Link>
        <Link href="/custom-style" className={btnOutline}>Request a custom style</Link>
      </div>
    </InfoPage>
  );
}
