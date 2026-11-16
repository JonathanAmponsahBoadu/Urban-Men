import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createInvitesWorkflow } from "@medusajs/medusa/core-flows";
import { ADMIN_EMAILS, ROOT_ADMIN_EMAIL } from "../lib/rbac";

/**
 * Deletes existing pending invites for ADMIN_EMAILS and re-creates them
 * so fresh (non-expired) tokens are generated.
 *
 *   npx medusa exec ./src/scripts/reset-invites.ts
 */
export default async function resetInvites({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const users = container.resolve(Modules.USER);
  const adminUrl = (process.env.BACKEND_URL ?? "http://localhost:9000").replace(/\/$/, "");

  const wanted = ADMIN_EMAILS.filter((e) => e !== ROOT_ADMIN_EMAIL);

  // Delete existing pending invites for these emails
  const pending = await users.listInvites({});
  const toDelete = pending.filter(
    (i) => !i.accepted && wanted.includes(i.email.toLowerCase())
  );

  if (toDelete.length > 0) {
    await users.deleteInvites(toDelete.map((i) => i.id));
    logger.info(`Deleted ${toDelete.length} old invite(s).`);
  }

  // Create fresh invites
  const { result } = await createInvitesWorkflow(container).run({
    input: { invites: wanted.map((email) => ({ email })) },
  });

  logger.info("=== FRESH INVITE LINKS ===");
  for (const invite of result) {
    logger.info(`${invite.email}: ${adminUrl}/app/invite?token=${invite.token}`);
  }
  logger.info("=== Send the links above. They expire in 24 hours. ===");
}
