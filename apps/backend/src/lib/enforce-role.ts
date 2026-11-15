import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { MedusaContainer } from "@medusajs/framework/types";
import { canAccess, canModifyUser, roleOf, targetUserId, type Role } from "./rbac";

type StaffUser = { id: string; email: string | null; metadata: Record<string, unknown> | null };

// Short-lived cache so a busy admin session does not look the same user up on every request.
const cache = new Map<string, { at: number; user: StaffUser }>();
const TTL_MS = 20_000;

export async function loadStaffUser(container: MedusaContainer, id: string): Promise<StaffUser | undefined> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.user;
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({ entity: "user", fields: ["id", "email", "metadata"], filters: { id } });
  const user = data[0] as StaffUser | undefined;
  if (user) cache.set(id, { at: Date.now(), user });
  return user;
}

/** Forget a cached user right after their role or details change. */
export const forgetStaffUser = (id: string) => cache.delete(id);

export async function loadStaffByEmail(container: MedusaContainer, email: string): Promise<StaffUser | undefined> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data } = await query.graph({ entity: "user", fields: ["id", "email", "metadata"], filters: { email } });
  return data[0] as StaffUser | undefined;
}

export function forbid(res: MedusaResponse, message: string) {
  res.status(403).json({ type: "not_allowed", message });
}

/**
 * Runs on every /admin route. Signed-in staff are checked against their role; the root owner is protected.
 * Requests with no staff user attached (public routes such as sign-in, or API keys) pass through untouched:
 * Medusa's own authentication still decides those.
 */
export async function enforceRole(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const auth = (req as MedusaRequest & { auth_context?: { actor_id?: string; actor_type?: string } }).auth_context;
  if (!auth?.actor_id || auth.actor_type !== "user") return next();

  const path = req.originalUrl.split("?")[0];
  try {
    const actor = await loadStaffUser(req.scope, auth.actor_id);
    if (!actor) return next();
    const role: Role = roleOf(actor);

    if (!canAccess(role, req.method, path)) {
      return forbid(res, "Your role does not have access to this.");
    }

    const target = targetUserId(path);
    if (target && req.method !== "GET") {
      const user = await loadStaffUser(req.scope, target);
      if (user && !canModifyUser({ id: actor.id, role }, user)) {
        return forbid(res, "Only the root owner can change or remove the root owner's account.");
      }
    }
    return next();
  } catch (e) {
    return next(e);
  }
}
