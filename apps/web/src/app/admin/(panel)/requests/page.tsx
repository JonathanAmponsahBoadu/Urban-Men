import type { Metadata } from "next";
import { RequestsAdmin } from "@/components/admin/RequestsAdmin";

export const metadata: Metadata = { title: "Style requests" };

export default function Page() {
  return <RequestsAdmin />;
}
