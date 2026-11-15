import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import ExpoPushProviderService from "./service";

export default ModuleProvider(Modules.NOTIFICATION, { services: [ExpoPushProviderService] });
