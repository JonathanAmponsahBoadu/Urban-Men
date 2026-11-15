import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Before launch: cancels every open order placed with a test address (...@example.com), which also puts the
 * reserved stock back. Real customer orders are never touched.
 *
 * Run:   npx medusa exec ./src/scripts/cancel-test-orders.ts
 */
export default async function cancelTestOrders({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "status"],
    filters: { email: { $like: "%@example.com" } as never },
  });
  const open = orders.filter((o) => o.status !== "canceled" && o.status !== "completed");

  for (const order of open) {
    await cancelOrderWorkflow(container).run({ input: { order_id: order.id } });
    logger.info(`Cancelled test order #${order.display_id} (${order.email}).`);
  }
  logger.info(open.length ? `Cancelled ${open.length} test order(s).` : "No open test orders.");
}
