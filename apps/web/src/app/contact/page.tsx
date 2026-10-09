import type { Metadata } from "next";
import { ContactDetails } from "@/components/info/ContactDetails";
import { ContactForm } from "@/components/info/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach Urban Men Apparel by phone, WhatsApp, Instagram or the contact form.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-10 md:pt-16">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">Contact</p>
      <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">We would love to hear from you.</h1>
      <p className="mt-5 max-w-2xl text-lg text-mist">Questions about sizes, an order or a custom style? Message us any way you like.</p>
      <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_20rem]">
        <ContactForm />
        <aside>
          <ContactDetails />
        </aside>
      </div>
    </main>
  );
}
