import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import type { z } from "zod";
import type { AnnouncementBody } from "../../middlewares";

/**
 * POST /admin/announcements { title, body, url? }
 * Tell customers about a new design or a pre-order opening: emailed to those who opted in to news,
 * and pushed to phones that allowed news. The sending runs in the background (see the announcement subscriber).
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof AnnouncementBody>>, res: MedusaResponse) {
  const bus = req.scope.resolve(Modules.EVENT_BUS);
  await bus.emit({ name: "announcement.created", data: req.validatedBody });
  res.status(202).json({ queued: true });
}
