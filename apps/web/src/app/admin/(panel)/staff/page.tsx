import type { Metadata } from "next";
import { StaffAdmin } from "@/components/admin/StaffAdmin";

export const metadata: Metadata = { title: "Staff & roles" };

export default function Page() {
  return <StaffAdmin />;
}
