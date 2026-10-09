import type { Metadata } from "next";
import { MyRequests } from "@/components/account/MyRequests";

export const metadata: Metadata = { title: "Style requests" };

export default function Page() {
  return <MyRequests />;
}
