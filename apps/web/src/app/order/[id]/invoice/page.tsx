import type { Metadata } from "next";
import { Invoice } from "@/components/Invoice";

export const metadata: Metadata = { title: "Receipt", robots: { index: false, follow: false } };

export default async function Page(props: PageProps<"/order/[id]/invoice">) {
  const { id } = await props.params;
  return <Invoice id={id} />;
}
