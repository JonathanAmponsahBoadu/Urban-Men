import type { Metadata } from "next";
import { Vouchers } from "@/components/account/Vouchers";

export const metadata: Metadata = { title: "Vouchers" };

export default function Page() {
  return <Vouchers />;
}
