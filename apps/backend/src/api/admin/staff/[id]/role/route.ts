import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError, Modules } from "@medusajs/framework/utils";
import type { z } from "zod";
import type { SetRoleBody } from "../../../../middlewares";
import { forgetStaffUser, loadStaffUser } from "../../../../../lib/enforce-role";
import { canModifyUser, isRootEmail, roleOf } from "../../../../../lib/rbac";

/**
 * POST /admin/staff/:id/role { role }: give a staff member a role.
 * Administrators and the root owner only. The root owner's role cannot be changed, and "owner" cannot be given.
 */
export async function POST(req: AuthenticatedMedusaRequest<z.infer<typeof SetRoleBody>>, res: MedusaResponse) {
  const actor = await loadStaffUser(req.scope, req.auth_context.actor_id);
  const target = await loadStaffUser(req.scope, req.params.id);
  if (!actor || !target) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Staff member not found");
  if (isRootEmail(target.email) || !canModifyUser({ id: actor.id, role: roleOf(actor) }, target)) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Only the root owner can change the root owner's account.");
  }
  const users = req.scope.resolve(Modules.USER);
  await users.updateUsers({ id: target.id, metadata: { ...(target.metadata ?? {}), role: req.validatedBody.role } });
  forgetStaffUser(target.id);
  res.json({ id: target.id, role: req.validatedBody.role });
}
