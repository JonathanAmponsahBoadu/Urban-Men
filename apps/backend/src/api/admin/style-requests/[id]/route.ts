import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { z } from "zod";
import type { UpdateStyleRequestBody } from "../../../middlewares";
import { STYLE_REQUEST_MODULE } from "../../../../modules/style-request";
import type StyleRequestModuleService from "../../../../modules/style-request/service";

/** GET /admin/style-requests/:id */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const style_request = await service.retrieveStyleRequest(req.params.id, { relations: ["messages"] });
  res.json({ style_request });
}

/** POST /admin/style-requests/:id: change the status, quote or internal note. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof UpdateStyleRequestBody>>, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const style_request = await service.updateStyleRequests({ id: req.params.id, ...req.validatedBody });
  res.json({ style_request });
}
