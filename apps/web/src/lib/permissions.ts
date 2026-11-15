import type { StaffRole } from "@/lib/types";

// Which admin areas each staff role can open. UI-only for now: real enforcement happens
// on the backend once it exists.
export type Permission =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "requests"
  | "inbox"
  | "reviews"
  | "customers"
  | "vouchers"
  | "settings"
  | "staff";

const all: Permission[] = ["dashboard", "products", "inventory", "orders", "requests", "inbox", "reviews", "customers", "vouchers", "settings", "staff"];

export const rolePermissions: Record<StaffRole, Permission[]> = {
  owner: all,
  admin: all,
  manager: ["dashboard", "products", "inventory", "orders", "requests", "inbox", "reviews", "customers", "vouchers"],
  inventory: ["inventory"],
  support: ["dashboard", "orders", "requests", "inbox", "reviews", "customers"],
};

export const roleDescriptions: Record<StaffRole, string> = {
  owner: "The root owner (kkwesi956@gmail.com). Everything, and the only one who can change their own email or sign-in. Cannot be removed by anyone.",
  admin: "Every area, including settings and staff accounts. Can add, change or remove any staff member except the root owner.",
  manager: "Products, inventory, orders, requests, messages, reviews, customers and vouchers. Cannot open settings or staff accounts.",
  inventory: "Inventory only: see stock, receive and adjust stock by size, and read the stock history. Cannot see orders, prices, customers or settings.",
  support: "Orders, style requests, messages, reviews and customers. Cannot change products or prices.",
};

export const permissionLabels: Record<Permission, string> = {
  dashboard: "Dashboard",
  products: "Products & prices",
  inventory: "Inventory (stock)",
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
  { href: "/admin/products", label: "Products & prices", perm: "products" },
  { href: "/admin/inventory", label: "Inventory", perm: "inventory" },
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
