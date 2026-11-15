import { Module } from "@medusajs/framework/utils";
import PushTokenModuleService from "./service";

export const PUSH_TOKEN_MODULE = "pushToken";

export default Module(PUSH_TOKEN_MODULE, { service: PushTokenModuleService });
