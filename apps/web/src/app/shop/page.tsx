import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/ShopView";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse every Urban Men shirt: African-print colour-blocking in white, black, navy, blue, cream and charcoal.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-7xl px-5 py-24 text-mist md:px-10">Loading the collection…</main>}>
      <ShopView />
    </Suspense>
  );
}
