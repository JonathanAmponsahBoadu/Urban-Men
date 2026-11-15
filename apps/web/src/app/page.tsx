import { AppPromo } from "@/components/AppPromo";
import { Collection } from "@/components/Collection";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Lookbook } from "@/components/Lookbook";
import { PreorderBand } from "@/components/PreorderBand";
import { Reveal } from "@/components/Reveal";
import { InstagramStrip, ReviewsStrip } from "@/components/SocialProof";
import { WhyUs } from "@/components/WhyUs";

export default function Home() {
  return (
    <main>
      <Hero />
      <Collection />
      <PreorderBand />
      <Reveal><Lookbook /></Reveal>
      <Reveal><WhyUs /></Reveal>
      <Reveal><ReviewsStrip /></Reveal>
      <Reveal><AppPromo /></Reveal>
      <Reveal><InstagramStrip /></Reveal>
      <Reveal><Contact /></Reveal>
    </main>
  );
}
