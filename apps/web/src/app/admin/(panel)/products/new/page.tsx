import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Add a new style" };

export default function Page() {
  return <ProductForm />;
}
