import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { z } from "zod";
import type { MessageBody } from "../../../../middlewares";
import { STYLE_REQUEST_MODULE } from "../../../../../modules/style-request";
import type StyleRequestModuleService from "../../../../../modules/style-request/service";

/** POST /admin/style-requests/:id/messages: the team replies to the customer. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof MessageBody>>, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const message = await service.createStyleRequestMessages({ request_id: req.params.id, from: "admin", text: req.validatedBody.text });
  res.status(201).json({ message });
}
