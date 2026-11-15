import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { REVIEW_MODULE } from "../../../modules/review";
import type ReviewModuleService from "../../../modules/review/service";

/** GET /admin/reviews?status=pending: reviews waiting for (or past) moderation. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE);
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const reviews = await service.listReviews(status ? { status: status as never } : {}, { order: { created_at: "DESC" } });
  res.json({ reviews });
}
