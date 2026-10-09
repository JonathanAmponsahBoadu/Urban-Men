import type { StaffRole } from "@/lib/types";

// Which admin areas each staff role can open. UI-only for now: real enforcement happens
// on the backend once it exists.
export type Permission =
  | "dashboard"
  | "products"
  | "orders"
  | "requests"
  | "inbox"
  | "reviews"
  | "customers"
  | "vouchers"
  | "settings"
  | "staff";

const all: Permission[] = ["dashboard", "products", "orders", "requests", "inbox", "reviews", "customers", "vouchers", "settings", "staff"];

export const rolePermissions: Record<StaffRole, Permission[]> = {
  owner: all,
  manager: ["dashboard", "products", "orders", "requests", "inbox", "reviews", "customers", "vouchers"],
  support: ["dashboard", "orders", "requests", "inbox", "reviews", "customers"],
};

export const roleDescriptions: Record<StaffRole, string> = {
  owner: "Everything, including homepage settings and staff accounts.",
  manager: "Products, stock, orders, requests, messages, reviews, customers and vouchers.",
  support: "Orders, style requests, messages, reviews and customers. Cannot change products or prices.",
};

export const permissionLabels: Record<Permission, string> = {
  dashboard: "Dashboard",
  products: "Products & stock",
  orders: "Orders",
  requests: "Style requests",
  inbox: "Inbox & returns",
  reviews: "Reviews",
  customers: "Customers",
  vouchers: "Vouchers",
  settings: "Homepage & settings",
  staff: "Staff & roles",
};

export const adminNav: { href: string; label: string; perm: Permission }[] = [
  { href: "/admin", label: "Dashboard", perm: "dashboard" },
  { href: "/admin/products", label: "Products & stock", perm: "products" },
  { href: "/admin/orders", label: "Orders", perm: "orders" },
  { href: "/admin/requests", label: "Style requests", perm: "requests" },
  { href: "/admin/inbox", label: "Inbox & returns", perm: "inbox" },
  { href: "/admin/reviews", label: "Reviews", perm: "reviews" },
  { href: "/admin/customers", label: "Customers", perm: "customers" },
  { href: "/admin/vouchers", label: "Vouchers", perm: "vouchers" },
  { href: "/admin/settings", label: "Homepage & settings", perm: "settings" },
  { href: "/admin/staff", label: "Staff & roles", perm: "staff" },
];

export function can(role: StaffRole | undefined, perm: Permission) {
  return rolePermissions[role ?? "owner"].includes(perm);
}

export function permissionForPath(path: string): Permission | undefined {
  if (path === "/admin") return "dashboard";
  return adminNav.find((n) => n.href !== "/admin" && path.startsWith(n.href))?.perm;
}
