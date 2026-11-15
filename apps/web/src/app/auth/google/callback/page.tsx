import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleCallback } from "@/components/GoogleCallback";

export const metadata: Metadata = { title: "Signing you in", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GoogleCallback />
    </Suspense>
  );
}
