/**
 * Role-based access for the admin API.
 *
 * Medusa's open-source admin has a single kind of staff user, so this layer adds the roles we need.
 * The rules (from the owner):
 *  - The root owner (kkwesi956@gmail.com) can do everything, is the only one who can change their own
 *    email or credentials, and can never be edited or removed by anyone else.
 *  - Administrators have access to everything and may add, change or remove any staff member except the root owner.
 *  - Inventory managers can work on inventory (stock) only.
 *
 * Pure functions only, so the rules can be unit-tested without a database.
 */
export const ROOT_ADMIN_EMAIL = (process.env.ROOT_ADMIN_EMAIL ?? "kkwesi956@gmail.com").trim().toLowerCase();

/** Emails that are administrators from their first sign-in (the owner named these two). */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "mandyemefa@gmail.com,nagbrand@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const ROLES = ["owner", "admin", "manager", "inventory", "support"] as const;
export type Role = (typeof ROLES)[number];
/** Roles that can be given to staff. "owner" is the root owner alone. */
export const ASSIGNABLE_ROLES = ["admin", "manager", "inventory", "support"] as const;

export const AREAS = ["products", "inventory", "orders", "requests", "inbox", "reviews", "customers", "vouchers", "settings", "staff"] as const;
export type Area = (typeof AREAS)[number];

const everything: readonly Area[] = AREAS;
export const rolePermissions: Record<Role, readonly Area[]> = {
  owner: everything,
  admin: everything,
  manager: ["products", "inventory", "orders", "requests", "inbox", "reviews", "customers", "vouchers"],
  inventory: ["inventory"],
  support: ["orders", "requests", "inbox", "reviews", "customers"],
};

type UserLike = { email?: string | null; metadata?: Record<string, unknown> | null };

export const isRootEmail = (email?: string | null) => Boolean(email) && email!.trim().toLowerCase() === ROOT_ADMIN_EMAIL;

/** The role of a staff user. Unknown accounts get the least access (support), never more. */
export function roleOf(user: UserLike): Role {
  if (isRootEmail(user.email)) return "owner";
  const email = user.email?.trim().toLowerCase();
  const stored = user.metadata?.role;
  if (typeof stored === "string" && (ASSIGNABLE_ROLES as readonly string[]).includes(stored)) return stored as Role;
  if (email && ADMIN_EMAILS.includes(email)) return "admin";
  return "support";
}

/** Which area an admin API path belongs to. "any" means every signed-in staff member may use it. */
export function areaForPath(path: string): Area | "any" {
  const p = path.replace(/^\/admin\/?/, "").split("?")[0];
  const [head, second] = p.split("/");
  if (!head) return "any";
  if (["auth", "feature-flags", "plugins", "users", "notification-preferences"].includes(head) && !(head === "users" && second !== "me")) return "any";
  if (head === "users" || head === "invites" || head === "staff") return "staff";
  if (["inventory-items", "reservations", "stock-locations"].includes(head)) return "inventory";
  if (["products", "product-variants", "product-categories", "product-tags", "product-types", "collections", "price-lists", "price-preferences", "uploads", "pricing"].includes(head)) return "products";
  if (["orders", "draft-orders", "order-edits", "returns", "exchanges", "claims", "fulfillments", "fulfillment-sets", "shipping-options", "shipping-profiles", "shipping-option-types", "payments", "payment-collections", "refund-reasons", "return-reasons", "order-changes"].includes(head)) return "orders";
  if (["customers", "customer-groups"].includes(head)) return "customers";
  if (["promotions", "campaigns"].includes(head)) return "vouchers";
  if (head === "style-requests") return "requests";
  if (head === "reviews") return "reviews";
  if (["notifications", "push-tokens"].includes(head)) return "inbox";
  if (["announcements"].includes(head)) return "inbox";
  // store settings, regions, currencies, taxes, sales channels, API keys, workflows ... : administrators only
  return "settings";
}

/** Inventory managers need product names and sizes to read stock, so they may READ the catalogue. */
const inventoryMayRead = new Set(["products", "product-variants", "product-categories", "collections"]);

/**
 * Medusa's admin screen itself reads these shared settings on every page (store name, menu layout, regions and sales
 * channels for filters). Every signed-in staff member may READ them or the admin will not open; only administrators may change them.
 */
const sharedReads = new Set(["stores", "layouts", "regions", "sales-channels", "currencies"]);

export function canAccess(role: Role, method: string, path: string): boolean {
  const area = areaForPath(path);
  if (area === "any") return true;
  const head = path.replace(/^\/admin\/?/, "").split(/[/?]/)[0];
  if (method.toUpperCase() === "GET" && sharedReads.has(head)) return true;
  if (rolePermissions[role].includes(area)) return true;
  if (role === "inventory" && method.toUpperCase() === "GET") return inventoryMayRead.has(head);
  return false;
}

/** The id in /admin/users/:id (not "me"), if the path targets one user. */
export function targetUserId(path: string): string | undefined {
  const m = /^\/admin\/users\/([^/?]+)/.exec(path);
  return m && m[1] !== "me" ? m[1] : undefined;
}

/** Changing or removing a user: nobody but the root owner may touch the root owner. */
export function canModifyUser(actor: { id: string; role: Role }, target: { id: string; email?: string | null }) {
  if (isRootEmail(target.email)) return actor.role === "owner" && actor.id === target.id;
  return actor.role === "owner" || actor.role === "admin";
}
