import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal information Urban Men collects, how we use it and your rights.",
};

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="Legal" title="Privacy policy" intro="We only collect what we need to sell you clothes and deliver them." draft>
      <Section title="What we collect">
        <ul className="list-disc space-y-2 pl-6">
          <li>Your name, email address and phone number when you create an account or place an order.</li>
          <li>Your delivery address and delivery notes.</li>
          <li>Your order details and, when you pay with Mobile Money, the number and network you pay from.</li>
          <li>Measurements and photos you choose to share, for example in a custom style request.</li>
          <li>Reviews and messages you send us.</li>
        </ul>
      </Section>

      <Section title="How we use it">
        <ul className="list-disc space-y-2 pl-6">
          <li>To process, deliver and support your orders.</li>
          <li>To keep you updated about your order by phone, SMS, email or WhatsApp.</li>
          <li>To reply to your messages and custom style requests.</li>
          <li>To send you news and offers, only if you joined our newsletter. You can ask to stop at any time.</li>
        </ul>
      </Section>

      <Section title="Who we share it with">
        <p>
          We share only what is needed with the people who help us serve you, such as payment providers and delivery partners. We do not sell your personal information.
        </p>
      </Section>

      <Section title="Cookies and browser storage">
        <p>
          The site stores your cart, wishlist and sign-in in your browser so it works as you expect. We do not use advertising cookies.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Under Ghana&apos;s Data Protection Act, 2012 (Act 843), you can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it. To do so, <Link href="/contact" className="text-gold underline-offset-4 hover:underline">contact us</Link>.
        </p>
      </Section>

      <Section title="Changes">
        <p>We may update this policy. The latest version is always on this page.</p>
      </Section>
    </InfoPage>
  );
}
