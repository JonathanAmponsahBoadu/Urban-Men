import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type { z } from "zod";
import type { MessageBody } from "../../../../middlewares";
import { STYLE_REQUEST_MODULE } from "../../../../../modules/style-request";
import type StyleRequestModuleService from "../../../../../modules/style-request/service";

/** POST /store/style-requests/:id/messages: a customer replies on their own request. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof MessageBody>>, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const [request] = await service.listStyleRequests({ id: req.params.id, customer_id: req.auth_context.actor_id });
  if (!request) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Style request not found");
  const message = await service.createStyleRequestMessages({ request_id: request.id, from: "customer", text: req.validatedBody.text });
  res.status(201).json({ message });
}
