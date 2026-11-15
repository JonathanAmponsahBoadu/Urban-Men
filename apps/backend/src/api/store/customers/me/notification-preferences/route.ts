import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { z } from "zod";
import type { NotificationPrefsBody } from "../../../../middlewares";
import { wantsEmail } from "../../../../../lib/notify";

/** GET /store/customers/me/notification-preferences */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customers = req.scope.resolve(Modules.CUSTOMER);
  const c = await customers.retrieveCustomer(req.auth_context.actor_id);
  const meta = (c.metadata ?? {}) as Record<string, unknown>;
  res.json({
    preferences: {
      order_email: wantsEmail(meta, "order"),
      news_email: wantsEmail(meta, "news"),
    },
  });
}

/** POST /store/customers/me/notification-preferences { order_email?, news_email? } */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof NotificationPrefsBody>>, res: MedusaResponse) {
  const customers = req.scope.resolve(Modules.CUSTOMER);
  const c = await customers.retrieveCustomer(req.auth_context.actor_id);
  const meta = { ...((c.metadata ?? {}) as Record<string, unknown>) };
  const { order_email, news_email } = req.validatedBody;
  if (order_email !== undefined) meta.notify_order_email = order_email;
  if (news_email !== undefined) meta.notify_news_email = news_email;
  await customers.updateCustomers(c.id, { metadata: meta });
  res.json({ preferences: { order_email: wantsEmail(meta, "order"), news_email: wantsEmail(meta, "news") } });
}
