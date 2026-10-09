import type { Metadata } from "next";
import Link from "next/link";
import { LookbookGallery } from "@/components/info/Lookbook";
import { btnPrimary } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "The Urban Men Signature Collections, styled and photographed.",
};

export default function LookbookPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Lookbook</p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
        Signature Collections, <em className="text-gold">worn.</em>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-mist">Tap any look to see the shirt and its details. Matching trousers come with it.</p>
      <div className="mt-12">
        <LookbookGallery />
      </div>
      <div className="mt-14 text-center">
        <Link href="/shop" className={btnPrimary}>Shop apparels</Link>
      </div>
    </main>
  );
}
