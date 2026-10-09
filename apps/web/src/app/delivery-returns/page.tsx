import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info/InfoPage";
import { ReturnWindow } from "@/components/info/ReturnWindow";

export const metadata: Metadata = {
  title: "Delivery & returns",
  description: "How Urban Men delivers your order, and how returns and exchanges work.",
};

export default function DeliveryReturnsPage() {
  return (
    <InfoPage eyebrow="Help" title="Delivery & returns" intro="What to expect after you order, and what to do if something is not right." draft>
      <Section title="Delivery">
        <p>We deliver to the address you give at checkout. The delivery cost and the time it will take depend on where you are, and we confirm both with you when your order is placed.</p>
        <p>
          We keep you posted about your order by phone or WhatsApp. You can also follow it any time under <Link href="/account/orders" className="text-gold underline-offset-4 hover:underline">Orders</Link> in your account, or with <Link href="/track" className="text-gold underline-offset-4 hover:underline">Track your order</Link>.
        </p>
      </Section>

      <Section title="Returns and exchanges">
        <p>
          If your shirt does not fit or is not what you expected, you can ask for a return or an exchange within <ReturnWindow /> of receiving it.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Items should be unworn, unwashed and in their original condition.</li>
          <li>Items made specially for you from a custom style request cannot be returned unless they are faulty.</li>
          <li>If an item arrives faulty or damaged, tell us straight away with a photo and we will make it right.</li>
        </ul>
      </Section>

      <Section title="How to ask for a return">
        <ol className="list-decimal space-y-2 pl-6">
          <li>Sign in and open the order under Orders, then choose “Request a return or exchange”. Or message us on WhatsApp with your order number.</li>
          <li>Tell us what is wrong and which size you would like instead, if you want an exchange.</li>
          <li>We reply with the next steps.</li>
        </ol>
      </Section>

      <Section title="Questions?">
        <p>
          Check the <Link href="/faq" className="text-gold underline-offset-4 hover:underline">FAQ</Link> or <Link href="/contact" className="text-gold underline-offset-4 hover:underline">contact us</Link>.
        </p>
      </Section>
    </InfoPage>
  );
}
