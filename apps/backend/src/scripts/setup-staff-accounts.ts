import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Sets passwords for staff and creates/links any missing user accounts.
 *
 * Run once against the Railway backend:
 *   npx medusa exec ./src/scripts/setup-staff-accounts.ts
 */

const STAFF: Array<{ name: string; email: string; password: string; firstName: string; lastName: string }> = [
  {
    name: "Mandy Emefa",
    firstName: "Mandy",
    lastName: "Emefa",
    email: "mandyemefa@gmail.com",
    password: "Mandy@UrbanMen2026",
  },
  {
    name: "NAG Brand",
    firstName: "NAG",
    lastName: "Brand",
    email: "nagbrand@gmail.com",
    password: "NAG@UrbanMen2026",
  },
];

export default async function setupStaffAccounts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const authModule = container.resolve(Modules.AUTH);
  const userModule = container.resolve(Modules.USER);

  logger.info("=== setup-staff-accounts: starting ===");

  for (const staff of STAFF) {
    const email = staff.email.toLowerCase();
    logger.info(`\n--- Processing ${staff.name} (${email}) ---`);

    // ── 1. Ensure a Medusa user record exists ──────────────────────────────
    const existingUsers = await userModule.listUsers({ email });
    let userId: string;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      logger.info(`  User record found: ${userId}`);
    } else {
      logger.info(`  No user record found — creating user record…`);
      const created = await userModule.createUsers({
        email,
        first_name: staff.firstName,
        last_name: staff.lastName,
      });
      userId = created.id;
      logger.info(`  Created user: ${userId}`);
    }

    // ── 2. Ensure an auth identity exists for emailpass provider ────────────
    const existingIdentities = await authModule.listProviderIdentities({
      entity_id: email,
      provider: "emailpass",
    });

    let authIdentityId: string;

    if (existingIdentities.length > 0) {
      authIdentityId = (existingIdentities[0].auth_identity_id ?? existingIdentities[0].id) as string;
      logger.info(`  Existing provider identity found, auth_identity_id: ${authIdentityId}`);
    } else {
      logger.info(`  No provider identity found — registering new auth identity…`);
      const res = await authModule.authenticate("emailpass", {
        authScope: "admin",
        body: { email, password: staff.password },
        action: "register",
      } as any);

      if (!res.success || !res.authIdentity) {
        throw new Error(`Failed to create auth identity for ${email}: ${res.error}`);
      }
      authIdentityId = res.authIdentity.id;
      logger.info(`  Created auth identity: ${authIdentityId}`);
    }

    // ── 3. Link auth identity to user via app_metadata.user_id ──────────────
    const authIdentity = await authModule.retrieveAuthIdentity(authIdentityId);
    const appMetadata = (authIdentity.app_metadata || {}) as Record<string, any>;

    if (appMetadata.user_id !== userId) {
      logger.info(`  Linking auth identity ${authIdentityId} to user ${userId} in app_metadata…`);
      appMetadata.user_id = userId;
      await authModule.updateAuthIdentities({
        id: authIdentityId,
        app_metadata: appMetadata,
      });
      logger.info(`  Linked successfully!`);
    } else {
      logger.info(`  Auth identity already linked to user ${userId}.`);
    }

    // ── 4. Set/update password using updateProvider ─────────────────────────
    logger.info(`  Setting password to '${staff.password}'…`);
    const updateRes = await authModule.updateProvider("emailpass", {
      entity_id: email,
      password: staff.password,
    });

    if (updateRes.success === false) {
      logger.error(`  ✗ updateProvider failed: ${updateRes.error}`);
    } else {
      logger.info(`  ✓ Password successfully set for ${email}!`);
    }

    // ── 5. Clean up any stale invites for this email ────────────────────────
    try {
      const invites = await userModule.listInvites({ email });
      if (invites.length > 0) {
        logger.info(`  Cleaning up ${invites.length} pending invite(s)…`);
        await userModule.deleteInvites(invites.map((i: any) => i.id));
      }
    } catch (e: any) {
      logger.warn(`  Could not clean up invites: ${e?.message ?? e}`);
    }
  }

  logger.info("\n=== setup-staff-accounts: complete! ===");
  logger.info("Credentials configured:");
  for (const s of STAFF) {
    logger.info(`  ${s.email}  →  ${s.password}`);
  }
}
