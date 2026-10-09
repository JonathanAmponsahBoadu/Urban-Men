import type { Metadata } from "next";
import { Measurements } from "@/components/account/Measurements";

export const metadata: Metadata = { title: "My measurements" };

export default function Page() {
  return <Measurements />;
}
