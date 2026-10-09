import type { Metadata } from "next";
import { VouchersAdmin } from "@/components/admin/VouchersAdmin";

export const metadata: Metadata = { title: "Vouchers" };

export default function Page() {
  return <VouchersAdmin />;
}
