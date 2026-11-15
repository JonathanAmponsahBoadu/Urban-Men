import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { PUSH_TOKEN_MODULE } from "../modules/push-token";
import { type AlertArea, recipientsFor } from "./admin-alerts";
import type PushTokenModuleService from "../modules/push-token/service";

/**
 * Everything that tells people something: emails (Resend) and in-app push (Expo), to customers and to the
 * administrators. Every call is wrapped so a failed email can never break an order.
 */
/** Public address of the shop, used for links inside emails and notifications. */
export const storefrontUrl = () => (process.env.STOREFRONT_URL ?? "https://urban-men.vercel.app").replace(/\/$/, "");
export const adminUrl = () => (process.env.BACKEND_URL ?? "http://localhost:9000").replace(/\/$/, "") + "/app";

type Container = Pick<MedusaContainer, "resolve">;

async function safe(container: Container, label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    logger.warn(`Notification skipped (${label}): ${(e as Error).message}`);
  }
}

export async function sendEmail(container: Container, to: string, template: string, data: Record<string, unknown>) {
  await safe(container, `email ${template} to ${to}`, () =>
    container.resolve(Modules.NOTIFICATION).createNotifications({ to, channel: "email", template, data }),
  );
}

export async function sendPush(container: Container, token: string, data: { title: string; body: string; url?: string }) {
  await safe(container, `push to ${token.slice(0, 22)}…`, async () => {
    await container.resolve(Modules.NOTIFICATION).createNotifications({ to: token, channel: "push", template: "push", data });
  });
}

/** Tokens of the phones belonging to a customer (who allowed the kind of update being sent). */
export async function customerTokens(container: Container, customerId: string | undefined | null, kind: "order" | "news") {
  if (!customerId) return [];
  const svc: PushTokenModuleService = container.resolve(PUSH_TOKEN_MODULE);
  const rows = await svc.listPushTokens({ customer_id: customerId });
  return rows.filter((r) => (kind === "order" ? r.order_opt_in : r.news_opt_in)).map((r) => r.token);
}

/** Tokens of the phones of these staff members. */
export async function staffTokens(container: Container, userIds: string[]) {
  if (userIds.length === 0) return [];
  const svc: PushTokenModuleService = container.resolve(PUSH_TOKEN_MODULE);
  const rows = await svc.listPushTokens({ user_id: userIds });
  return rows.map((r) => r.token);
}

/**
 * Tell the team about something in `area`, but only the staff who opted in to it, and only by the channel
 * (email, phone or both) they chose. See lib/admin-alerts.ts. Nobody who has not consented is contacted.
 */
export async function notifyAdmins(
  container: Container,
  alert: { area: AlertArea; title: string; lines: string[]; path?: string; push?: { title: string; body: string } },
) {
  const url = alert.path ? `${adminUrl()}${alert.path}` : adminUrl();
  const users = await container.resolve(Modules.USER).listUsers({}, { select: ["id", "email", "metadata"] });
  const { emails, pushUserIds } = recipientsFor(users, alert.area);
  if (emails.length === 0 && pushUserIds.length === 0) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    logger.warn(`Nobody has opted in to "${alert.area}" alerts (Medusa admin > My notifications). "${alert.title}" was not sent.`);
    return;
  }
  await Promise.all(emails.map((to) => sendEmail(container, to, "admin-alert", { title: alert.title, lines: alert.lines, url })));
  const tokens = await staffTokens(container, pushUserIds).catch(() => []);
  const push = alert.push ?? { title: alert.title, body: alert.lines[0] ?? "" };
  await Promise.all(tokens.map((t) => sendPush(container, t, { ...push, url })));
}

/** Customer preferences live on the customer's metadata (set from the account page or the app). */
export function wantsEmail(metadata: Record<string, unknown> | null | undefined, kind: "order" | "news") {
  const key = kind === "order" ? "notify_order_email" : "notify_news_email";
  const v = metadata?.[key];
  return typeof v === "boolean" ? v : kind === "order"; // order updates default on, news defaults off
}
