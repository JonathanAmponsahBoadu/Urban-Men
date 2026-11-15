import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { z } from "zod";
import { allowedAreas, normalizePrefs, readPrefs } from "../../../lib/admin-alerts";
import { PUSH_TOKEN_MODULE } from "../../../modules/push-token";
import type PushTokenModuleService from "../../../modules/push-token/service";
import type { AlertPrefsBody } from "../../middlewares";

async function describe(req: AuthenticatedMedusaRequest) {
  const users = req.scope.resolve(Modules.USER);
  const user = await users.retrieveUser(req.auth_context.actor_id, { select: ["id", "email", "metadata"] });
  const phones = await (req.scope.resolve(PUSH_TOKEN_MODULE) as PushTokenModuleService).listPushTokens({ user_id: user.id });
  return {
    user,
    body: {
      email: user.email,
      // undefined until the person chooses: until then nothing is sent to them
      preferences: readPrefs(user) ?? null,
      available_areas: allowedAreas(user),
      phones: phones.length,
    },
  };
}

/** GET /admin/notification-preferences: my own choices for team alerts. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  res.json((await describe(req)).body);
}

/** POST /admin/notification-preferences { email, push, areas }: opt in or out of team alerts (only for myself). */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AlertPrefsBody>>, res: MedusaResponse) {
  const { user } = await describe(req);
  const alerts = normalizePrefs(user, req.validatedBody);
  await req.scope.resolve(Modules.USER).updateUsers({ id: user.id, metadata: { ...(user.metadata ?? {}), alerts } });
  res.json((await describe(req)).body);
}
