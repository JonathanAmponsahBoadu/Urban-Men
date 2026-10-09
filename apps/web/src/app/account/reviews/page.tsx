import type { Metadata } from "next";
import { MyReviews } from "@/components/account/MyReviews";

export const metadata: Metadata = { title: "Ratings & reviews" };

export default function Page() {
  return <MyReviews />;
}
