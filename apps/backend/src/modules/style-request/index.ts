import { Module } from "@medusajs/framework/utils";
import StyleRequestModuleService from "./service";

export const STYLE_REQUEST_MODULE = "styleRequest";

export default Module(STYLE_REQUEST_MODULE, { service: StyleRequestModuleService });
