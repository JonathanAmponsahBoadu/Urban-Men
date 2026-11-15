import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { notifyAdmins } from "../lib/notify";
import { REVIEW_MODULE } from "../modules/review";
import type ReviewModuleService from "../modules/review/service";

/** A new review is waiting for approval. */
export default async function reviewCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const svc: ReviewModuleService = container.resolve(REVIEW_MODULE);
  const r = await svc.retrieveReview(data.id);
  await notifyAdmins(container, {
    area: "reviews",
    title: `New ${r.rating}-star review to approve`,
    lines: [`${r.author_name}${r.verified_purchase ? " (verified purchase)" : ""}: ${r.body.slice(0, 240)}`],
    path: "/reviews",
    push: { title: "Review to approve", body: `${r.rating}★ from ${r.author_name}` },
  });
}

export const config: SubscriberConfig = { event: "review.created" };
