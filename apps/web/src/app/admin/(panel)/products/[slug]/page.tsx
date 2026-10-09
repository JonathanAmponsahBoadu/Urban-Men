import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Edit product" };

export default async function Page(props: PageProps<"/admin/products/[slug]">) {
  const { slug } = await props.params;
  return <ProductForm slug={slug} />;
}
