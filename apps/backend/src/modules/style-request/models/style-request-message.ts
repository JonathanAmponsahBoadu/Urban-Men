import { model } from "@medusajs/framework/utils";
import StyleRequest from "./style-request";

/** One message in the conversation on a style request. */
const StyleRequestMessage = model.define("style_request_message", {
  id: model.id({ prefix: "srm" }).primaryKey(),
  from: model.enum(["customer", "admin"]),
  text: model.text(),
  request: model.belongsTo(() => StyleRequest, { mappedBy: "messages" }),
});

export default StyleRequestMessage;
