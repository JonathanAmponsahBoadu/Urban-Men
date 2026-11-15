import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { STYLE_REQUEST_MODULE } from "../../../modules/style-request";
import type StyleRequestModuleService from "../../../modules/style-request/service";

/** GET /admin/style-requests?status=new: every request, newest first. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: StyleRequestModuleService = req.scope.resolve(STYLE_REQUEST_MODULE);
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const style_requests = await service.listStyleRequests(status ? { status: status as never } : {}, {
    relations: ["messages"],
    order: { created_at: "DESC" },
  });
  res.json({ style_requests });
}
