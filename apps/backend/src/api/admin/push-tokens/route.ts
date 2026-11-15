import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { z } from "zod";
import type { PushTokenBody } from "../../middlewares";
import { PUSH_TOKEN_MODULE } from "../../../modules/push-token";
import type PushTokenModuleService from "../../../modules/push-token/service";

/** POST /admin/push-tokens { token }: a staff member's phone, so admin alerts reach it. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof PushTokenBody>>, res: MedusaResponse) {
  const svc: PushTokenModuleService = req.scope.resolve(PUSH_TOKEN_MODULE);
  const { token, platform } = req.validatedBody;
  const user_id = req.auth_context.actor_id;
  const [existing] = await svc.listPushTokens({ token });
  const push_token = existing
    ? await svc.updatePushTokens({ id: existing.id, user_id, customer_id: null, platform })
    : await svc.createPushTokens({ token, platform, user_id });
  res.status(existing ? 200 : 201).json({ push_token });
}
