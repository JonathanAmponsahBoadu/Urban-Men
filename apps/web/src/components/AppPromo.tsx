import Image from "next/image";
import { Logo } from "@/components/Logo";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { products } from "@/data/products";
import { site, whatsappUrl } from "@/data/site";
import { displayName, formatPrice } from "@/lib/format";

const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

const features = [
  "Browse the whole collection with one tap",
  "Save favourites and check out faster",
  "Track your orders and get updates",
  "Request a custom style with your own photos",
];

function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-theme="dark"
      className={`relative aspect-[9/18.5] w-[250px] overflow-hidden rounded-[2.4rem] border-[6px] border-[#05070c] bg-navy-deep shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/15 ${className}`}
    >
      <div aria-hidden className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      {children}
    </div>
  );
}

function MiniCard({ slug }: { slug: string }) {
  const p = bySlug(slug);
  return (
    <div>
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-navy-soft">
        <Image src={p.images[0].src} alt="" fill sizes="110px" className="object-cover" />
      </div>
      <p className="mt-1 truncate text-[0.6rem] leading-tight">{displayName(p)}</p>
      <p className="text-[0.6rem] font-semibold text-gold">{formatPrice(p.price) ?? ""}</p>
    </div>
  );
}

/** Phone 1: home screen of the (future) app */
function HomeScreen() {
  const hero = bySlug("emerald-kente-shirt");
  return (
    <PhoneFrame className="relative z-10">
      <div className="flex h-full flex-col pt-9 text-ivory">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-1.5">
            <Logo variant="monogram" decorative className="h-5" />
            <span className="font-display text-[0.6rem] tracking-[0.2em]">URBAN MEN</span>
          </div>
          <div className="relative">
            <BagIcon className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-gold text-[0.45rem] font-bold text-navy">2</span>
          </div>
        </div>
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[0.55rem] text-mist">
          <SearchIcon className="h-3 w-3" /> Search shirts, prints…
        </div>
        <div className="relative mx-3 mt-2 aspect-[16/10] overflow-hidden rounded-lg bg-navy-soft">
          <Image src={hero.images[0].src} alt="" fill sizes="220px" className="object-cover object-top" />
          <div className="absolute inset-0 bg-linear-to-t from-navy-deep/90 to-transparent" />
          <p className="absolute bottom-2 left-2 font-display text-xs">Signature Collections</p>
        </div>
        <div className="mt-2 flex gap-1.5 px-3 text-[0.55rem]">
          <span className="rounded-full bg-gold px-2 py-0.5 font-semibold text-navy">All</span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-mist">Long sleeve</span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-mist">Short sleeve</span>
        </div>
        <div className="mt-2 grid flex-1 grid-cols-2 gap-2 overflow-hidden px-3">
          <MiniCard slug="midnight-panel-shirt" />
          <MiniCard slug="sunburst-shirt" />
        </div>
        <div className="mt-1 flex items-center justify-around border-t border-white/10 bg-navy py-2 text-mist">
          <span className="text-gold"><HeartIcon className="h-4 w-4" /></span>
          <SearchIcon className="h-4 w-4" />
          <BagIcon className="h-4 w-4" />
          <UserIcon className="h-4 w-4" />
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Phone 2: product screen */
function ProductScreen() {
  const p = bySlug("navy-yoke-shirt");
  return (
    <PhoneFrame className="relative">
      <div className="flex h-full flex-col text-ivory">
        <div className="relative h-[58%] bg-navy-soft">
          <Image src={p.images[0].src} alt="" fill sizes="250px" className="object-cover" />
          <span className="absolute right-3 top-9 flex h-6 w-6 items-center justify-center rounded-full bg-navy/80"><HeartIcon className="h-3.5 w-3.5" /></span>
        </div>
        <div className="flex flex-1 flex-col px-3 pt-3">
          <p className="font-display text-sm leading-tight">{displayName(p)}</p>
          <p className="mt-0.5 text-sm font-semibold text-gold">{formatPrice(p.price)}</p>
          <p className="mt-0.5 text-[0.55rem] text-emerald-700 dark:text-emerald-300">In stock</p>
          <div className="mt-2 flex gap-1.5 text-[0.55rem]">
            {["S", "M", "L", "XL"].map((s, i) => (
              <span key={s} className={`flex h-6 w-7 items-center justify-center rounded border ${i === 1 ? "border-gold bg-gold font-semibold text-navy" : "border-white/20"}`}>{s}</span>
            ))}
          </div>
          <div className="mt-auto pb-4">
            <div className="rounded-full bg-gold py-2 text-center text-[0.6rem] font-semibold uppercase tracking-widest text-navy">Add to cart</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function AppPromo() {
  const hasApk = Boolean(site.apkUrl);
  return (
    <section id="app" className="relative overflow-hidden bg-navy-deep py-20 md:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/4 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-10 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">The Urban Men app</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Our whole collection, <em className="text-gold">in your pocket.</em>
          </h2>
          <p className="mt-5 max-w-lg text-lg text-mist">
            An Android app for faster shopping, built for the way you already shop on your phone.
            {!hasApk && " It is on its way."}
          </p>
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-ivory/90">
                <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-gold" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {hasApk ? (
              <a
                href={site.apkUrl}
                download
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-navy transition-colors hover:bg-gold-deep"
              >
                <AndroidMark /> Download the APK
              </a>
            ) : (
              <span
                aria-disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-mist"
              >
                <AndroidMark /> APK coming soon
              </span>
            )}
            <a
              href={whatsappUrl("Hello Urban Men, please tell me when the app is ready.")}
              className="inline-flex items-center justify-center rounded-full border border-gold/60 px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-navy"
            >
              {hasApk ? "Need help installing?" : "Notify me on WhatsApp"}
            </a>
          </div>
          <p className="mt-4 text-xs text-mist">
            {hasApk
              ? "Android only. Your phone may ask you to allow installing from this site."
              : "Android first. Preview shown: the final app design may change."}
          </p>
        </div>

        <div className="relative mx-auto flex h-[34rem] w-full max-w-xl items-center justify-center sm:h-[36rem]" aria-label="Preview of the Urban Men app">
          <div className="absolute left-0 top-10 hidden -rotate-6 scale-95 opacity-90 sm:block">
            <ProductScreen />
          </div>
          <div className="relative rotate-3 sm:ml-44">
            <HomeScreen />
          </div>
        </div>
      </div>
    </section>
  );
}

function AndroidMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M17.6 9.5a6 6 0 0 0-11.2 0zM8.5 6.4 7.2 4.2M15.5 6.4l1.3-2.2" stroke="currentColor" strokeWidth="1" />
      <path d="M6.4 10.5h11.2v7a1.5 1.5 0 0 1-1.5 1.5H15v2.5a1.2 1.2 0 0 1-2.4 0V19h-1.2v2.5a1.2 1.2 0 0 1-2.4 0V19H7.9a1.5 1.5 0 0 1-1.5-1.5zM4 10.8a1.2 1.2 0 0 1 2.4 0v5.4a1.2 1.2 0 0 1-2.4 0zm13.6 0a1.2 1.2 0 0 1 2.4 0v5.4a1.2 1.2 0 0 1-2.4 0z" />
    </svg>
  );
}
