import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export default async function diagUsers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModule = container.resolve(Modules.USER);
  const authModule = container.resolve(Modules.AUTH);

  const users = await userModule.listUsers({});
  logger.info(`Total Users in User module: ${users.length}`);
  for (const u of users) {
    logger.info(`User: ${u.id} - ${u.email} (${u.first_name || ""} ${u.last_name || ""})`);
  }

  const providers = await authModule.listProviderIdentities({});
  logger.info(`Total Provider Identities: ${providers.length}`);
  for (const p of providers) {
    logger.info(`ProviderIdentity: ${p.id} - auth_id: ${p.auth_identity_id} - entity_id: ${p.entity_id} - provider: ${p.provider}`);
  }
}
