import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createInvitesWorkflow } from "@medusajs/medusa/core-flows";
import { ADMIN_EMAILS, ROOT_ADMIN_EMAIL } from "../lib/rbac";

/**
 * Invites the shop's administrators (mandyemefa@gmail.com and nagbrand@gmail.com) to the admin dashboard.
 *
 *   npx medusa exec ./src/scripts/invite-admins.ts
 *
 * Each person opens their invite link, chooses their own password and signs in. Their role (admin, full access)
 * comes from ADMIN_EMAILS in the environment, so no one has to be promoted by hand. Safe to run again: people who
 * already have an account or a pending invite are skipped.
 *
 * The root owner is NOT invited this way. Create that account yourself so only you know the password:
 *   npx medusa user -e kkwesi956@gmail.com -p <your-password>
 */
export default async function inviteAdmins({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const users = container.resolve(Modules.USER);
  const adminUrl = (process.env.BACKEND_URL ?? "http://localhost:9000").replace(/\/$/, "");

  const existingUsers = new Set((await users.listUsers({})).map((u) => u.email.toLowerCase()));
  const pending = await users.listInvites({});
  const pendingByEmail = new Map(pending.filter((i) => !i.accepted).map((i) => [i.email.toLowerCase(), i]));

  const wanted = ADMIN_EMAILS.filter((e) => e !== ROOT_ADMIN_EMAIL);
  const todo = wanted.filter((e) => !existingUsers.has(e) && !pendingByEmail.has(e));

  for (const email of wanted) {
    if (existingUsers.has(email)) logger.info(`${email}: already has an admin account.`);
  }
  for (const [email, invite] of pendingByEmail) {
    if (wanted.includes(email)) logger.info(`${email}: invite already sent. Link: ${adminUrl}/app/invite?token=${invite.token}`);
  }

  if (todo.length === 0) return;
  const { result } = await createInvitesWorkflow(container).run({ input: { invites: todo.map((email) => ({ email })) } });
  for (const invite of result) {
    logger.info(`${invite.email}: invited. Send them this link: ${adminUrl}/app/invite?token=${invite.token}`);
  }
}
