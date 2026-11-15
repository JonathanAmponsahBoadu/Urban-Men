import type { Metadata } from "next";
import { InventoryAdmin } from "@/components/admin/InventoryAdmin";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return <InventoryAdmin />;
}
