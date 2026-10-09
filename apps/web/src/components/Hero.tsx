import Image from "next/image";
import Link from "next/link";
import { HeroSlides } from "@/components/HeroSlides";
import { ScissorsIcon } from "@/components/icons";
import { site, whatsappUrl } from "@/data/site";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden lg:h-[calc(100dvh-4rem)] lg:min-h-124">
      {/* soft gold glow behind the model */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 gap-x-10 gap-y-5 px-4 py-5 md:px-10 lg:grid-cols-2 lg:grid-rows-[1fr_auto_1fr] lg:gap-y-0 lg:py-4">
        {/* brand: always first on small screens */}
        <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-2">
          <Image
            src="/brand/logo-full-gold.png"
            alt="Urban Men Apparel — Signature Collections"
            width={1600}
            height={1702}
            preload
            className="h-auto w-44 sm:w-56 lg:w-[clamp(12rem,min(30vw,40dvh),24rem)]"
          />
          <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-gold sm:text-xs sm:tracking-[0.4em]">
            {site.tagline}
          </p>
        </div>

        {/* slideshow: sized to fit the screen height */}
        <div className="flex items-center justify-center lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:min-h-0">
          <HeroSlides />
        </div>

        {/* actions */}
        <div className="flex flex-col items-center text-center lg:col-start-1 lg:row-start-3 lg:justify-start lg:pt-6">
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/shop"
              className="w-full rounded-full bg-gold px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-navy transition-colors hover:bg-gold-deep sm:w-auto"
            >
              Shop apparels
            </Link>
            <a
              href="#collection"
              className="w-full rounded-full border border-gold/60 px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-navy sm:w-auto"
            >
              View collections
            </a>
          </div>
          <div className="mt-4 flex flex-col items-center gap-x-6 gap-y-2 text-sm text-mist sm:flex-row">
            <Link href="/custom-style" className="group inline-flex items-center gap-2 hover:text-gold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/50 text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                <ScissorsIcon className="h-4 w-4" />
              </span>
              Request a custom style
            </Link>
            <a href={whatsappUrl("Hello Urban Men, I would like to place an order.")} className="hover:text-gold">
              Or chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
