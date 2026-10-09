import type { Metadata } from "next";
import { Addresses } from "@/components/account/Addresses";

export const metadata: Metadata = { title: "Addresses & MoMo" };

export default function Page() {
  return <Addresses />;
}
