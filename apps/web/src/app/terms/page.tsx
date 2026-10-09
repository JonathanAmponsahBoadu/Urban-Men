import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Section } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for using the Urban Men website and buying from us.",
};

export default function TermsPage() {
  return (
    <InfoPage eyebrow="Legal" title="Terms of use" intro="The simple rules for using our site and buying from us." draft>
      <Section title="Orders">
        <p>
          When you place an order you are asking to buy the items in it. We confirm your order with you, including sizes, price and delivery, before it is final. We may decline an order, for example if an item is out of stock, and if so we will tell you.
        </p>
      </Section>

      <Section title="Prices and payment">
        <p>Prices are in Ghana cedis (GH₵). Delivery costs are confirmed separately. Payment is by Mobile Money or as arranged with us on WhatsApp.</p>
      </Section>

      <Section title="Delivery, returns and exchanges">
        <p>
          See our <Link href="/delivery-returns" className="text-gold underline-offset-4 hover:underline">delivery &amp; returns</Link> page. It forms part of these terms.
        </p>
      </Section>

      <Section title="Custom styles">
        <p>
          For custom styles we reply with what is possible and a price. Work starts once you agree. Because these items are made for you, they cannot be returned unless faulty.
        </p>
      </Section>

      <Section title="Your account">
        <p>Keep your sign-in details safe. You are responsible for activity on your account.</p>
      </Section>

      <Section title="Reviews and messages">
        <p>Please be honest and respectful. We may remove content that is abusive, misleading or unrelated to our products.</p>
      </Section>

      <Section title="Our content">
        <p>The photos, text and designs on this site belong to Urban Men Apparel. Please do not copy them without our permission.</p>
      </Section>

      <Section title="Liability and law">
        <p>We take care to keep the site accurate and available, but we cannot promise it will always be error-free. These terms are governed by the laws of Ghana.</p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? <Link href="/contact" className="text-gold underline-offset-4 hover:underline">Contact us</Link>.
        </p>
      </Section>
    </InfoPage>
  );
}
