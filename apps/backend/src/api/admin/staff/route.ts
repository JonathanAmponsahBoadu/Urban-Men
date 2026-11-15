import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ASSIGNABLE_ROLES, isRootEmail, roleOf } from "../../../lib/rbac";

/** GET /admin/staff: everyone with an admin sign-in, with their role. Administrators and the root owner only. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({ entity: "user", fields: ["id", "email", "first_name", "last_name", "metadata", "created_at"] });
  const staff = data.map((u) => ({
    id: u.id,
    email: u.email,
    name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email,
    role: roleOf(u),
    is_root: isRootEmail(u.email),
    created_at: u.created_at,
  }));
  res.json({ staff, assignable_roles: ASSIGNABLE_ROLES });
}
