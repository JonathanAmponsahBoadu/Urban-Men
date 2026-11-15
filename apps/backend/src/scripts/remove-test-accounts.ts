import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Before launch: removes customer accounts made with a test address (...@example.com) together with their logins.
 * Run `cancel-test-orders.ts` first so their orders are cancelled. Real customers are never touched.
 *
 * Run:   npx medusa exec ./src/scripts/remove-test-accounts.ts
 */
export default async function removeTestAccounts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const customers = container.resolve(Modules.CUSTOMER);
  const auth = container.resolve(Modules.AUTH);

  const found = await customers.listCustomers({ email: { $like: "%@example.com" } } as never);
  const emails = new Set(found.map((c) => c.email?.toLowerCase()));
  if (found.length) await customers.deleteCustomers(found.map((c) => c.id));

  const identities = await auth.listAuthIdentities({}, { relations: ["provider_identities"] });
  const mine = identities.filter((i) => i.provider_identities?.some((p) => p.entity_id && emails.has(p.entity_id.toLowerCase())));
  if (mine.length) await auth.deleteAuthIdentities(mine.map((i) => i.id));

  logger.info(`Removed ${found.length} test account(s) and ${mine.length} login(s).`);
}
