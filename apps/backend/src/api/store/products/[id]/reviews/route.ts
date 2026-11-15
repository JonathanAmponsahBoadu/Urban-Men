import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { z } from "zod";
import type { CreateReviewBody } from "../../../../middlewares";
import { REVIEW_MODULE } from "../../../../../modules/review";
import type ReviewModuleService from "../../../../../modules/review/service";

/** GET /store/products/:id/reviews: approved reviews plus the average and the star breakdown. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE);
  const reviews = await service.listReviews({ product_id: req.params.id, status: "approved" }, { order: { created_at: "DESC" } });
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => Number(r.rating) === stars).length }));
  res.json({ reviews, count, average, distribution });
}

/** POST /store/products/:id/reviews: a signed-in customer reviews a product. Held for approval. */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof CreateReviewBody>>, res: MedusaResponse) {
  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const customerId = req.auth_context.actor_id;

  const { data: customers } = await query.graph({ entity: "customer", fields: ["id", "first_name", "last_name"], filters: { id: customerId } });
  const customer = customers[0];
  const author_name = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || "Customer";

  // verified purchase: the customer has a delivered order containing this product
  let verified_purchase = false;
  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "status", "fulfillments.delivered_at", "items.product_id"],
      filters: { customer_id: customerId },
    });
    verified_purchase = orders.some((o) => o.fulfillments?.some((f) => f?.delivered_at) && o.items?.some((i) => i?.product_id === req.params.id));
  } catch {
    /* if the order lookup fails the review is simply not marked verified */
  }

  const review = await service.createReviews({
    product_id: req.params.id,
    customer_id: customerId,
    author_name,
    rating: req.validatedBody.rating,
    title: req.validatedBody.title ?? null,
    body: req.validatedBody.body,
    verified_purchase,
  });
  await req.scope.resolve(Modules.EVENT_BUS).emit({ name: "review.created", data: { id: review.id } });
  res.status(201).json({ review });
}
