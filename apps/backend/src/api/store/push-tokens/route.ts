import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { z } from "zod";
import type { PushTokenBody } from "../../middlewares";
import { PUSH_TOKEN_MODULE } from "../../../modules/push-token";
import type PushTokenModuleService from "../../../modules/push-token/service";

/**
 * POST /store/push-tokens { token, platform }
 * The app registers its phone so it can receive notifications. Signed-in customers get the phone linked to
 * their account (so order updates reach them); shoppers who never sign in still get news if they allow it.
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PushTokenBody>>, res: MedusaResponse) {
  const svc: PushTokenModuleService = req.scope.resolve(PUSH_TOKEN_MODULE);
  const { token, platform } = req.validatedBody;
  const customer_id = req.auth_context?.actor_id ?? null;
  const [existing] = await svc.listPushTokens({ token });
  const push_token = existing
    ? await svc.updatePushTokens({ id: existing.id, platform, ...(customer_id ? { customer_id } : {}) })
    : await svc.createPushTokens({ token, platform, customer_id });
  res.status(existing ? 200 : 201).json({ push_token });
}

/** DELETE /store/push-tokens { token }: the app was signed out or notifications were turned off. */
export async function DELETE(req: AuthenticatedMedusaRequest<z.infer<typeof PushTokenBody>>, res: MedusaResponse) {
  const svc: PushTokenModuleService = req.scope.resolve(PUSH_TOKEN_MODULE);
  const rows = await svc.listPushTokens({ token: req.validatedBody.token });
  if (rows.length) await svc.deletePushTokens(rows.map((r) => r.id));
  res.json({ deleted: rows.length });
}
