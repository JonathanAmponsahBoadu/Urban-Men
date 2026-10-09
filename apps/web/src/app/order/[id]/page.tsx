import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/OrderConfirmation";

export const metadata: Metadata = { title: "Order placed", robots: { index: false, follow: false } };

export default async function Page(props: PageProps<"/order/[id]">) {
  const { id } = await props.params;
  return <OrderConfirmation id={id} />;
}
