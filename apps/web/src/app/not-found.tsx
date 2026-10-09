import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-gold">404</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">We could not find that page.</h1>
      <p className="mt-4 text-lg text-mist">The piece you are looking for may have moved.</p>
      <Link
        href="/shop"
        className="mt-8 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-navy transition-colors hover:bg-gold-deep"
      >
        Back to the shop
      </Link>
    </main>
  );
}
