import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { acceptInviteWorkflow } from "@medusajs/core-flows";

export default async function testAccept({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const userModule = container.resolve(Modules.USER);
  const authModule = container.resolve(Modules.AUTH);

  const invites = await userModule.listInvites({ email: "mandyemefa@gmail.com" });
  if (!invites.length) {
    logger.error("No invite found for mandyemefa@gmail.com");
    return;
  }
  const invite = invites[0];
  logger.info(`Found invite: ${invite.id}, token length: ${invite.token.length}`);

  // Find auth identity for mandyemefa@gmail.com
  const providers = await authModule.listProviderIdentities({ entity_id: "mandyemefa@gmail.com" });
  logger.info(`Found provider identities: ${providers.length}`);
  if (!providers.length) {
    logger.error("No provider identity found");
    return;
  }
  const authIdentityId = providers[0].auth_identity_id;
  logger.info(`Auth Identity ID: ${authIdentityId}`);

  try {
    const { result } = await acceptInviteWorkflow(container).run({
      input: {
        invite_token: invite.token,
        auth_identity_id: authIdentityId,
        user: {
          email: "mandyemefa@gmail.com",
          first_name: "Mandy",
          last_name: "Emefa",
        },
      },
    });
    logger.info(`SUCCESS! Created user: ${JSON.stringify(result)}`);
  } catch (err: any) {
    logger.error(`WORKFLOW FAILED: ${err.message}`);
    if (err.stack) logger.error(err.stack);
  }
}
