import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { z } from "zod";
import type { UpdateReviewBody } from "../../../middlewares";
import { REVIEW_MODULE } from "../../../../modules/review";
import type ReviewModuleService from "../../../../modules/review/service";

/** POST /admin/reviews/:id: approve or reject a review. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof UpdateReviewBody>>, res: MedusaResponse) {
  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE);
  const review = await service.updateReviews({ id: req.params.id, status: req.validatedBody.status });
  res.json({ review });
}

/** DELETE /admin/reviews/:id */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE);
  await service.deleteReviews(req.params.id);
  res.json({ id: req.params.id, deleted: true });
}
