import type { Metadata } from "next";
import { Wishlist } from "@/components/account/Wishlist";

export const metadata: Metadata = { title: "Wishlist" };

export default function Page() {
  return <Wishlist />;
}
