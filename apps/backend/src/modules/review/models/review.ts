import { model } from "@medusajs/framework/utils";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

/** A customer's rating and comment on a product. Shown on the shop once the team approves it. */
const Review = model
  .define("review", {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text(),
    customer_id: model.text().nullable(),
    author_name: model.text(),
    /** 1 to 5 */
    rating: model.number(),
    title: model.text().nullable(),
    body: model.text(),
    status: model.enum([...REVIEW_STATUSES]).default("pending"),
    /** true when the reviewer has a delivered order containing this product */
    verified_purchase: model.boolean().default(false),
  })
  .indexes([{ on: ["product_id", "status"] }]);

export default Review;
