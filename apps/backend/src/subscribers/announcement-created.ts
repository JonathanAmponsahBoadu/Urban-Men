import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { PUSH_TOKEN_MODULE } from "../modules/push-token";
import type PushTokenModuleService from "../modules/push-token/service";
import { sendEmail, sendPush, wantsEmail } from "../lib/notify";

const BATCH = 25;

/**
 * An announcement (new design, pre-order opening): email the customers who opted in to news and push it to the
 * phones that allowed news. Sent in small batches so a large customer list never floods the provider.
 */
export default async function announcementCreated({ event: { data }, container }: SubscriberArgs<{ title: string; body: string; url?: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const customerModule = container.resolve(Modules.CUSTOMER);

  const pageSize = 200;
  for (let skip = 0; ; skip += pageSize) {
    const customers = await customerModule.listCustomers({ has_account: true }, { select: ["id", "email", "metadata"], skip, take: pageSize });
    if (customers.length === 0) break;
    const targets = customers.filter((c) => c.email && wantsEmail(c.metadata as Record<string, unknown>, "news"));
    for (let i = 0; i < targets.length; i += BATCH) {
      await Promise.all(targets.slice(i, i + BATCH).map((c) => sendEmail(container, c.email!, "announcement", { title: data.title, body: data.body, url: data.url })));
    }
    if (customers.length < pageSize) break;
  }

  const tokens: PushTokenModuleService = container.resolve(PUSH_TOKEN_MODULE);
  for (let skip = 0; ; skip += 200) {
    const rows = await tokens.listPushTokens({ news_opt_in: true }, { skip, take: 200 });
    for (let i = 0; i < rows.length; i += BATCH) {
      await Promise.all(rows.slice(i, i + BATCH).map((r) => sendPush(container, r.token, { title: data.title, body: data.body, url: data.url })));
    }
    if (rows.length < 200) break;
  }
  void query;
}

export const config: SubscriberConfig = { event: "announcement.created" };
