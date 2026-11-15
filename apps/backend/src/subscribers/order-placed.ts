import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { customerTokens, notifyAdmins, sendEmail, sendPush, storefrontUrl, wantsEmail } from "../lib/notify";

/** A new order: thank the customer (if they want updates) and tell the administrators. */
export default async function orderPlaced({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "currency_code", "total", "customer_id", "metadata", "items.title", "items.quantity", "items.variant_title", "shipping_address.first_name", "shipping_address.phone"],
    filters: { id: data.id },
  });
  const order = orders[0];
  if (!order) return;

  const customer = order.customer_id
    ? (await query.graph({ entity: "customer", fields: ["id", "metadata"], filters: { id: order.customer_id } })).data[0]
    : undefined;
  const meta = (order.metadata ?? {}) as Record<string, unknown>;
  const pre = meta.preorder ? { paid_now: Number(meta.paid_now), balance: Number(meta.balance), ready_by: meta.ready_by as string | undefined } : undefined;
  const items = (order.items ?? []).map((i) => ({ title: i?.title, variant_title: i?.variant_title, quantity: i?.quantity }));

  // customer: guests who ticked "email me updates" at checkout, and account holders who allow order emails
  const emailOk = customer ? wantsEmail(customer.metadata as Record<string, unknown>, "order") : meta.updates_by_email !== false;
  if (order.email && emailOk) {
    await sendEmail(container, order.email, "order-placed", {
      display_id: order.display_id,
      name: order.shipping_address?.first_name,
      total: order.total,
      currency: order.currency_code,
      items,
      preorder: pre,
      url: `${storefrontUrl()}/track`,
    });
  }
  for (const token of await customerTokens(container, order.customer_id, "order")) {
    await sendPush(container, token, { title: "Order received", body: `Thank you! We are confirming order #${order.display_id}.`, url: `${storefrontUrl()}/track` });
  }

  await notifyAdmins(container, {
    area: "orders",
    title: `${pre ? "New pre-order" : "New order"} #${order.display_id}`,
    lines: [
      `${order.shipping_address?.first_name ?? "A customer"} ordered ${items.reduce((n, i) => n + Number(i.quantity ?? 0), 0)} item(s).`,
      ...items.map((i) => `${i.quantity} × ${i.title}${i.variant_title ? ` (${i.variant_title})` : ""}`),
      `Total: GH₵ ${Number(order.total).toFixed(2)}`,
      pre ? `Pre-order: ${pre.paid_now} paid now, ${pre.balance} balance.` : "",
    ].filter(Boolean),
    path: `/orders/${order.id}`,
    push: { title: pre ? "New pre-order" : "New order", body: `#${order.display_id} · GH₵ ${Number(order.total).toFixed(2)}` },
  });
}

export const config: SubscriberConfig = { event: "order.placed" };
