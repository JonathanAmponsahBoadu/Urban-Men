import Link from "next/link";

const iconBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
  "aria-hidden": true,
};

const reasons = [
  {
    title: "Luxury",
    text: "Finishing and detail you can see and feel.",
    icon: (
      <svg {...iconBase}><path d="M6 4h12l3 5-9 11L3 9z" /><path d="M3 9h18M9 4l3 5 3-5M12 20 9 9m3 11 3-11" /></svg>
    ),
  },
  {
    title: "Premium fabric",
    text: "Quality cotton, linen and authentic African prints.",
    icon: (
      <svg {...iconBase}><path d="M4 7c3-2 5 2 8 0s5-2 8 0M4 12c3-2 5 2 8 0s5-2 8 0M4 17c3-2 5 2 8 0s5-2 8 0" /></svg>
    ),
  },
  {
    title: "Classy",
    text: "Understated colour-blocking made for formal occasions.",
    icon: (
      <svg {...iconBase}><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" /><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>
    ),
  },
  {
    title: "Impeccable fit",
    text: "Clean, tailored cuts that sit right on the shoulder.",
    icon: (
      <svg {...iconBase}><path d="M3 17 17 3l4 4L7 21z" /><path d="M7 13l2 2M10 10l2 2M13 7l2 2" /></svg>
    ),
  },
  {
    title: "Unmatched style",
    text: "Signature looks you will not find on the rack.",
    icon: (
      <svg {...iconBase}><path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z" /></svg>
    ),
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="relative overflow-hidden bg-gold py-16 text-navy md:py-24">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em]">Why choose us</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-5xl">
              Professional. Timeless. <em>Authentic.</em>
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex w-fit items-center justify-center rounded-full bg-navy px-7 py-3 text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-navy-deep"
          >
            Shop apparels
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((r, i) => (
            <div
              key={r.title}
              className="group relative overflow-hidden rounded-2xl bg-navy p-6 text-ivory shadow-lg shadow-navy/20 transition-transform duration-300 hover:-translate-y-1"
            >
              <span aria-hidden className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl text-white/5 transition-colors group-hover:text-gold/15">
                0{i + 1}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy">
                {r.icon}
              </span>
              <h3 className="relative mt-5 text-lg font-bold text-gold">{r.title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-mist">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
