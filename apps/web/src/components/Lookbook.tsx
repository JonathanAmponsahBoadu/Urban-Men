import Image from "next/image";
import Link from "next/link";

export function Lookbook() {
  return (
    <section id="lookbook" className="py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:gap-16 md:px-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-navy-soft">
            <Image
              src="/images/products/navy-kente-yoke-shirt.jpg"
              alt="Man in a navy shirt with a kente yoke, front view"
              fill
              sizes="(min-width: 768px) 22vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="relative mt-10 aspect-4/5 overflow-hidden rounded-sm bg-navy-soft">
            <Image
              src="/images/products/navy-kente-yoke-shirt-back.jpg"
              alt="Same man seen from behind, showing the kente yoke across the shoulders"
              fill
              sizes="(min-width: 768px) 22vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold">The lookbook</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Details that are noticed <em className="text-gold">from every angle.</em>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist">
            Print on the shoulders, along the placket, inside the collar. Our shirts are cut
            straight and worn untucked, in the way African formal wear is meant to be, so the
            tailoring and the cloth do the talking.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block border-b border-gold pb-1 text-sm font-semibold uppercase tracking-widest text-gold"
          >
            See the full collection
          </Link>
        </div>
      </div>
    </section>
  );
}
