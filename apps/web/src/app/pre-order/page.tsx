import type { Metadata } from "next";
import { PreorderView } from "@/components/PreorderView";

export const metadata: Metadata = {
  title: "Pre-order",
  description: "Reserve the next Urban Men designs before they are made. How pre-ordering works, and the designs open for pre-order.",
};

export default function PreorderPage() {
  return <PreorderView />;
}
