import type { Metadata } from "next";
import { TrackOrder } from "@/components/info/TrackOrder";

export const metadata: Metadata = {
  title: "Track your order",
  description: "See where your Urban Men order is, with your order number and phone number.",
};

export default function TrackPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Help</p>
      <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">Track your order</h1>
      <p className="mt-5 text-lg text-mist">Enter your order number (it starts with UM-) and the phone number you gave when ordering.</p>
      <div className="mt-10">
        <TrackOrder />
      </div>
    </main>
  );
}
