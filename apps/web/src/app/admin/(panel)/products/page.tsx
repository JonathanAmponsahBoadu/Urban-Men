import type { Metadata } from "next";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export const metadata: Metadata = { title: "Products & stock" };

export default function Page() {
  return <ProductsAdmin />;
}
