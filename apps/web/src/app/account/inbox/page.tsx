import type { Metadata } from "next";
import { Inbox } from "@/components/account/Inbox";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return <Inbox />;
}
