import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { notifyAdmins } from "../lib/notify";
import { STYLE_REQUEST_MODULE } from "../modules/style-request";
import type StyleRequestModuleService from "../modules/style-request/service";

/** A customer asked for a custom style. */
export default async function styleRequestCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const svc: StyleRequestModuleService = container.resolve(STYLE_REQUEST_MODULE);
  const r = await svc.retrieveStyleRequest(data.id);
  await notifyAdmins(container, {
    area: "requests",
    title: "New custom style request",
    lines: [`From ${r.name} (${r.contact}).`, r.description.slice(0, 240), r.budget ? `Budget: ${r.budget}` : "", r.colour ? `Colour: ${r.colour}` : ""].filter(Boolean),
    path: "/style-requests",
    push: { title: "Custom style request", body: `${r.name}: ${r.description.slice(0, 80)}` },
  });
}

export const config: SubscriberConfig = { event: "style_request.created" };
