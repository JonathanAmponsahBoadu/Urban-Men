import { site, whatsappUrl } from "@/data/site";

export function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="grid items-center gap-10 rounded-sm border border-gold/40 bg-navy-soft p-8 md:grid-cols-[1.2fr_1fr] md:p-14">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold">Order or enquire</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Tell us what you need.<br />
              <em className="text-gold">We will take it from there.</em>
            </h2>
            <a
              href={whatsappUrl("Hello Urban Men, I would like to place an order.")}
              className="mt-8 inline-block rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-navy transition-colors hover:bg-gold-deep"
            >
              Order on WhatsApp
            </a>
          </div>
          <dl className="space-y-6 text-lg">
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-mist">Call</dt>
              <dd>
                <a href={site.phoneHref} className="font-display text-3xl hover:text-gold">
                  {site.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-mist">Instagram</dt>
              <dd>
                <a href={site.instagramUrl} className="hover:text-gold">
                  @{site.instagramHandle}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-mist">Facebook</dt>
              <dd>{site.facebookName}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
