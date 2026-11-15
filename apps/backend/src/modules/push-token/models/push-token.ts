import { model } from "@medusajs/framework/utils";

/** A phone that has the Urban Men app installed and allowed notifications. */
const PushToken = model
  .define("push_token", {
    id: model.id({ prefix: "pt" }).primaryKey(),
    /** the Expo push token, e.g. ExponentPushToken[xxxx] */
    token: model.text().unique(),
    /** set when a signed-in customer registered the phone */
    customer_id: model.text().nullable(),
    /** set when a staff member registered the phone (admin alerts) */
    user_id: model.text().nullable(),
    platform: model.text().default("android"),
    /** the owner of the phone chose to get news about new designs and pre-orders */
    news_opt_in: model.boolean().default(true),
    /** order updates and replies (on by default) */
    order_opt_in: model.boolean().default(true),
  })
  .indexes([{ on: ["customer_id"] }, { on: ["user_id"] }]);

export default PushToken;
