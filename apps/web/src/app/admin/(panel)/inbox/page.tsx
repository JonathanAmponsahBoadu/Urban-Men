import type { Metadata } from "next";
import { InboxAdmin } from "@/components/admin/InboxAdmin";

export const metadata: Metadata = { title: "Inbox & returns" };

export default function Page() {
  return <InboxAdmin />;
}
