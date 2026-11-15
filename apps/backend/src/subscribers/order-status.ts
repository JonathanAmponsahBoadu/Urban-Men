import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { customerTokens, sendEmail, sendPush, storefrontUrl, wantsEmail } from "../lib/notify";

const messages: Record<string, { status: string; push: string }> = {
  "order.fulfillment_created": { status: "is being prepared", push: "is being prepared" },
  "shipment.created": { status: "is on its way", push: "is on its way" },
  "delivery.created": { status: "was delivered", push: "was delivered" },
  "order.canceled": { status: "was cancelled", push: "was cancelled" },
};

/** Tells the customer when their order moves along. */
export default async function orderStatus({ event: { name, data }, container }: SubscriberArgs<{ id?: string; order_id?: string }>) {
  const m = messages[name];
  const id = data.order_id ?? data.id;
  if (!m || !id) return;
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "customer_id", "metadata", "items.title", "items.quantity", "items.variant_title"],
    filters: { id },
  });
  const order = orders[0];
  if (!order) return;
  const customer = order.customer_id
    ? (await query.graph({ entity: "customer", fields: ["id", "metadata"], filters: { id: order.customer_id } })).data[0]
    : undefined;
  const meta = (order.metadata ?? {}) as Record<string, unknown>;
  const emailOk = customer ? wantsEmail(customer.metadata as Record<string, unknown>, "order") : meta.updates_by_email !== false;
  if (order.email && emailOk) {
    await sendEmail(container, order.email, "order-update", {
      display_id: order.display_id,
      status: m.status,
      items: (order.items ?? []).map((i) => ({ title: i?.title, variant_title: i?.variant_title, quantity: i?.quantity })),
      url: `${storefrontUrl()}/track`,
    });
  }
  for (const token of await customerTokens(container, order.customer_id, "order")) {
    await sendPush(container, token, { title: `Order #${order.display_id}`, body: `Your order ${m.push}.`, url: `${storefrontUrl()}/track` });
  }
}

export const config: SubscriberConfig = { event: ["order.fulfillment_created", "shipment.created", "delivery.created", "order.canceled"] };
