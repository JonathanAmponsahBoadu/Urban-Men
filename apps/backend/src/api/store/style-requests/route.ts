import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { z } from "zod";
import type { CreateStyleRequestBody } from "../../middlewares";
import { STYLE_REQUEST_MODULE } from "../../../modules/style-request";
import type StyleRequestModuleService from "../../../modules/style-request/service";

/** POST /store/style-requests: send a custom-style request (text, optional photos). */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof CreateStyleRequestBody>>, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const body = req.validatedBody;
  const request = await service.createStyleRequests({
    customer_id: req.auth_context?.actor_id ?? null,
    name: body.name,
    contact: body.contact,
    description: body.description,
    colour: body.colour ?? null,
    budget: body.budget ?? null,
    measurements: body.measurements ?? null,
    images: body.images ? { urls: body.images } : null,
  });
  await req.scope.resolve(Modules.EVENT_BUS).emit({ name: "style_request.created", data: { id: request.id } });
  res.status(201).json({ style_request: request });
}

/** GET /store/style-requests: the signed-in customer's own requests, with their conversations. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const style_requests = await service.listStyleRequests(
    { customer_id: req.auth_context.actor_id },
    { relations: ["messages"], order: { created_at: "DESC" } },
  );
  res.json({ style_requests });
}
