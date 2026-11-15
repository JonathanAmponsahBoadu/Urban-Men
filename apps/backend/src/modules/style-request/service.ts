import { MedusaService } from "@medusajs/framework/utils";
import StyleRequest from "./models/style-request";
import StyleRequestMessage from "./models/style-request-message";

class StyleRequestModuleService extends MedusaService({ StyleRequest, StyleRequestMessage }) {}

export default StyleRequestModuleService;
