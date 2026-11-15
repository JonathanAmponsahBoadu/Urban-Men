import { model } from "@medusajs/framework/utils";
import StyleRequestMessage from "./style-request-message";

export const STYLE_REQUEST_STATUSES = ["new", "reviewing", "quoted", "accepted", "declined"] as const;

/** A customer asking for a style to be made for them (a description, optional photos, optional budget). */
const StyleRequest = model.define("style_request", {
  id: model.id({ prefix: "sr" }).primaryKey(),
  /** set when the customer was signed in */
  customer_id: model.text().nullable(),
  name: model.text(),
  /** phone or email the team replies to */
  contact: model.text(),
  description: model.text(),
  colour: model.text().nullable(),
  budget: model.text().nullable(),
  measurements: model.text().nullable(),
  /** the reference photos the customer uploaded, stored as { urls: string[] } */
  images: model.json().nullable(),
  status: model.enum([...STYLE_REQUEST_STATUSES]).default("new"),
  /** GH₵, filled in when the team quotes */
  quote_amount: model.number().nullable(),
  admin_note: model.text().nullable(),
  messages: model.hasMany(() => StyleRequestMessage, { mappedBy: "request" }),
});

export default StyleRequest;
