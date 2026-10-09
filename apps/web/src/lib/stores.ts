"use client";

// FRONTEND-ONLY data layer. Every store persists to this browser's localStorage,
// standing in for the backend (accounts, orders, reviews, inbox, admin edits).
// Nothing here is secure or shared between devices; replace with API calls later.
import type { Product } from "@/data/products";
import { ADMIN_EMAIL, checkAdminCredentials } from "@/lib/adminAuth";
import { createStore, uid, useStore } from "@/lib/storage";
import type {
  CartItem,
  ContactMessage,
  Delivery,
  InboxMessage,
  NotifyRequest,
  Order,
  OrderLine,
  OrderStatus,
  Payment,
  ActivityEntry,
  Address,
  Measurements,
  ReturnRequest,
  ReturnStatus,
  Review,
  SavedMomo,
  StaffAccount,
  StaffRole,
  Size,
  StyleRequest,
  Subscriber,
  User,
  Voucher,
} from "@/lib/types";

/* ---------- stores ---------- */
export const usersStore = createStore<User[]>("um.users", []);
export const sessionStore = createStore<string | null>("um.session", null);
export const cartStore = createStore<CartItem[]>("um.cart", []);
export const wishlistStore = createStore<string[]>("um.wishlist", []);
export const ordersStore = createStore<Order[]>("um.orders", []);
export const reviewsStore = createStore<Review[]>("um.reviews", []);
export const inboxStore = createStore<InboxMessage[]>("um.inbox", []);
export const requestsStore = createStore<StyleRequest[]>("um.requests", []);
export const vouchersStore = createStore<Voucher[]>("um.vouchers", []);
export const notifyStore = createStore<NotifyRequest[]>("um.notify", []);
export const returnsStore = createStore<ReturnRequest[]>("um.returns", []);
export const activityStore = createStore<ActivityEntry[]>("um.activity", []);
export const recentStore = createStore<string[]>("um.recent", []);
export const staffStore = createStore<StaffAccount[]>("um.staff", []);
export const subscribersStore = createStore<Subscriber[]>("um.subscribers", []);
export const contactMessagesStore = createStore<ContactMessage[]>("um.contact", []);

export type CatalogueEdits = {
  added: Product[];
  patches: Record<string, Partial<Product>>;
  removed: string[];
};
export const catalogueEditsStore = createStore<CatalogueEdits>("um.catalogue", {
  added: [],
  patches: {},
  removed: [],
});

/* ---------- auth (demo: no real password check) ---------- */
export function useCurrentUser(): User | null {
  const users = useStore(usersStore);
  const id = useStore(sessionStore);
  return users.find((u) => u.id === id) ?? null;
}

export function signUp(input: { name: string; email: string; phone?: string }): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (email === ADMIN_EMAIL) return { ok: false, error: "That email is reserved. Please use a different one." };
  if (usersStore.getSnapshot().some((u) => u.email === email)) {
    return { ok: false, error: "An account with that email already exists. Try signing in." };
  }
  const user: User = {
    id: uid("usr"),
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() || undefined,
    role: "shopper",
    createdAt: new Date().toISOString(),
  };
  usersStore.update((u) => [...u, user]);
  sessionStore.set(user.id);
  sendMessage(user.id, "Urban Men", "Welcome to Urban Men", "Thank you for joining us. Browse the collection, save favourites to your wishlist, or request a style made just for you.");
  return { ok: true };
}

export function signIn(emailRaw: string): { ok: true } | { ok: false; error: string } {
  const email = emailRaw.trim().toLowerCase();
  const user = usersStore.getSnapshot().find((u) => u.email === email);
  if (!user) return { ok: false, error: "We could not find an account with that email. Create one first." };
  if (user.role === "admin") return { ok: false, error: "That is a staff account. Please use the admin sign-in." };
  sessionStore.set(user.id);
  return { ok: true };
}

/** Preview-only admin sign-in (see src/lib/adminAuth.ts). Replaced by the real backend later. */
export function signInAdmin(email: string, password: string): { ok: true } | { ok: false; error: string } {
  if (!checkAdminCredentials(email, password)) return { ok: false, error: "Wrong email or password." };
  const users = usersStore.getSnapshot();
  let admin = users.find((u) => u.email === ADMIN_EMAIL);
  if (!admin) {
    admin = { id: "usr_admin", name: "Store Owner", email: ADMIN_EMAIL, role: "admin", staffRole: "owner", createdAt: new Date().toISOString() };
    usersStore.update((list) => [...list, admin!]);
  } else if (admin.role !== "admin" || admin.staffRole !== "owner") {
    const fixed = { ...admin, role: "admin" as const, staffRole: "owner" as const };
    usersStore.update((list) => list.map((u) => (u.id === fixed.id ? fixed : u)));
  }
  sessionStore.set(admin.id);
  return { ok: true };
}

export function signOut() {
  sessionStore.set(null);
}

export function updateProfile(userId: string, patch: Partial<Pick<User, "name" | "phone" | "address">>) {
  usersStore.update((list) => list.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
}

/* ---------- inbox ---------- */
export function sendMessage(userId: string, from: string, subject: string, body: string) {
  const msg: InboxMessage = { id: uid("msg"), userId, from, subject, body, createdAt: new Date().toISOString(), read: false };
  inboxStore.update((list) => [msg, ...list]);
}

/* ---------- cart & wishlist ---------- */
export function addToCart(slug: string, size: Size, qty = 1) {
  cartStore.update((items) => {
    const found = items.find((i) => i.slug === slug && i.size === size);
    if (found) return items.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i));
    return [...items, { slug, size, qty }];
  });
}

export function setCartQty(slug: string, size: Size, qty: number) {
  cartStore.update((items) =>
    qty <= 0
      ? items.filter((i) => !(i.slug === slug && i.size === size))
      : items.map((i) => (i.slug === slug && i.size === size ? { ...i, qty } : i)),
  );
}

export function removeFromCart(slug: string, size: Size) {
  setCartQty(slug, size, 0);
}

export function toggleWishlist(slug: string) {
  wishlistStore.update((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
}

/* ---------- vouchers ---------- */
export function findVoucher(code: string): Voucher | undefined {
  const c = code.trim().toUpperCase();
  return vouchersStore.getSnapshot().find((v) => v.active && v.code.toUpperCase() === c);
}

/* ---------- orders ---------- */
export function placeOrder(
  user: User,
  lines: OrderLine[],
  products: Product[],
  voucher?: Voucher,
  extra?: { payment?: Payment; delivery?: Delivery },
): Order {
  const allPriced = lines.every((l) => l.price !== undefined);
  const subtotal = allPriced ? lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0) : undefined;
  const discount = subtotal !== undefined && voucher ? Math.round(subtotal * voucher.percentOff) / 100 : undefined;
  const order: Order = {
    id: `UM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    userId: user.id,
    createdAt: new Date().toISOString(),
    lines,
    status: "Awaiting confirmation",
    total: subtotal !== undefined ? Math.round((subtotal - (discount ?? 0)) * 100) / 100 : undefined,
    voucher: voucher?.code,
    discount,
    payment: extra?.payment,
    delivery: extra?.delivery,
  };
  ordersStore.update((list) => [order, ...list]);
  // take the units out of stock (tracked cumulatively so repeat lines of one product add up)
  const stockNow = new Map<string, Product["stock"]>();
  for (const l of lines) {
    const p = products.find((x) => x.slug === l.slug);
    if (!p) continue;
    const current = stockNow.get(l.slug) ?? p.stock;
    stockNow.set(l.slug, { ...current, [l.size]: Math.max(0, current[l.size] - l.qty) });
  }
  catalogueEditsStore.update((edits) => {
    const patches = { ...edits.patches };
    const added = edits.added.map((p) => (stockNow.has(p.slug) ? { ...p, stock: stockNow.get(p.slug)! } : p));
    for (const [slug, stock] of stockNow) {
      if (!edits.added.some((p) => p.slug === slug)) patches[slug] = { ...patches[slug], stock };
    }
    return { ...edits, patches, added };
  });
  sendMessage(
    user.id,
    "Urban Men",
    `We received your order ${order.id}`,
    "Thank you! We will confirm sizes, price and delivery with you shortly. You can follow the status under Orders.",
  );
  return order;
}

export function setOrderStatus(orderId: string, status: OrderStatus) {
  const order = ordersStore.getSnapshot().find((o) => o.id === orderId);
  if (!order || order.status === status) return;
  ordersStore.update((list) => list.map((o) => (o.id === orderId ? { ...o, status } : o)));
  sendMessage(order.userId, "Urban Men", `Order ${order.id}: ${status}`, `Your order status is now "${status}".`);
}

/* ---------- reviews ---------- */
export function addReview(user: User, slug: string, rating: number, body: string, title?: string) {
  const review: Review = {
    id: uid("rev"),
    slug,
    userId: user.id,
    userName: user.name,
    rating,
    title: title?.trim() || undefined,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  reviewsStore.update((list) => [review, ...list]);
}

export function deleteReview(id: string) {
  reviewsStore.update((list) => list.filter((r) => r.id !== id));
}

/* ---------- custom style requests ---------- */
export function submitStyleRequest(user: User, data: Omit<StyleRequest, "id" | "userId" | "userName" | "status" | "createdAt" | "thread">) {
  const now = new Date().toISOString();
  const req: StyleRequest = {
    ...data,
    thread: [{ from: "customer", text: data.description, at: now }],
    id: `REQ-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    userId: user.id,
    userName: user.name,
    status: "New",
    createdAt: new Date().toISOString(),
  };
  const ok = requestsStore.update((list) => [req, ...list]);
  if (ok) {
    sendMessage(user.id, "Urban Men", `Style request ${req.id} received`, "We will review your style and reply with what is possible and a price.");
  }
  return { ok, request: req };
}

export function setRequestStatus(id: string, status: StyleRequest["status"], adminNote?: string) {
  const req = requestsStore.getSnapshot().find((r) => r.id === id);
  if (!req) return;
  const note = adminNote?.trim();
  requestsStore.update((list) =>
    list.map((r) =>
      r.id === id
        ? { ...r, status, adminNote: note || r.adminNote, thread: note ? [...(r.thread ?? []), { from: "admin" as const, text: note, at: new Date().toISOString() }] : r.thread }
        : r,
    ),
  );
  sendMessage(req.userId, "Urban Men", `Style request ${id}: ${status}`, note ? note : `Your style request is now "${status}".`);
}

/** A customer follows up on their own request. */
export function customerReplyToRequest(id: string, text: string) {
  const msg = text.trim();
  if (!msg) return;
  requestsStore.update((list) =>
    list.map((r) => (r.id === id ? { ...r, thread: [...(r.thread ?? []), { from: "customer" as const, text: msg, at: new Date().toISOString() }] } : r)),
  );
}

/* ---------- admin: vouchers ---------- */
export function saveVoucher(v: Omit<Voucher, "id"> & { id?: string }) {
  vouchersStore.update((list) =>
    v.id ? list.map((x) => (x.id === v.id ? ({ ...x, ...v } as Voucher) : x)) : [...list, { ...v, id: uid("vch") } as Voucher],
  );
}
export function deleteVoucher(id: string) {
  vouchersStore.update((list) => list.filter((v) => v.id !== id));
}

/* ---------- newsletter & contact form ---------- */
export function subscribeEmail(emailRaw: string): { ok: true; already: boolean } | { ok: false; error: string } {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (subscribersStore.getSnapshot().some((x) => x.email === email)) return { ok: true, already: true };
  subscribersStore.update((list) => [{ id: uid("sub"), email, createdAt: new Date().toISOString() }, ...list]);
  return { ok: true, already: false };
}

export function submitContactMessage(data: { name: string; contact: string; message: string }) {
  const msg: ContactMessage = { id: uid("cm"), ...data, createdAt: new Date().toISOString(), handled: false };
  return contactMessagesStore.update((list) => [msg, ...list]);
}

/* ---------- account: addresses, MoMo numbers, measurements ---------- */
export function saveAddress(userId: string, address: Omit<Address, "id"> & { id?: string }) {
  usersStore.update((list) =>
    list.map((u) => {
      if (u.id !== userId) return u;
      const existing = u.addresses ?? [];
      const next: Address = { ...address, id: address.id ?? uid("adr") };
      return { ...u, addresses: existing.some((a) => a.id === next.id) ? existing.map((a) => (a.id === next.id ? next : a)) : [...existing, next] };
    }),
  );
}
export function deleteAddress(userId: string, id: string) {
  usersStore.update((list) => list.map((u) => (u.id === userId ? { ...u, addresses: (u.addresses ?? []).filter((a) => a.id !== id) } : u)));
}
export function saveMomoNumber(userId: string, m: Omit<SavedMomo, "id">) {
  usersStore.update((list) =>
    list.map((u) => {
      if (u.id !== userId) return u;
      const existing = u.momoNumbers ?? [];
      return existing.some((x) => x.phone === m.phone && x.network === m.network) ? u : { ...u, momoNumbers: [...existing, { ...m, id: uid("mm") }] };
    }),
  );
}
export function deleteMomoNumber(userId: string, id: string) {
  usersStore.update((list) => list.map((u) => (u.id === userId ? { ...u, momoNumbers: (u.momoNumbers ?? []).filter((m) => m.id !== id) } : u)));
}
export function saveMeasurements(userId: string, measurements: Measurements) {
  usersStore.update((list) => list.map((u) => (u.id === userId ? { ...u, measurements } : u)));
}

/* ---------- returns & exchanges ---------- */
export function requestReturn(user: User, data: Omit<ReturnRequest, "id" | "userId" | "userName" | "status" | "createdAt">) {
  const req: ReturnRequest = { ...data, id: `RET-${Date.now().toString(36).toUpperCase().slice(-6)}`, userId: user.id, userName: user.name, status: "New", createdAt: new Date().toISOString() };
  returnsStore.update((list) => [req, ...list]);
  sendMessage(user.id, "Urban Men", `${data.type} request ${req.id} received`, `We received your ${data.type.toLowerCase()} request for order ${data.orderId} and will reply soon.`);
  return req;
}
export function setReturnStatus(id: string, status: ReturnStatus) {
  const r = returnsStore.getSnapshot().find((x) => x.id === id);
  if (!r || r.status === status) return;
  returnsStore.update((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
  sendMessage(r.userId, "Urban Men", `${r.type} request ${id}: ${status}`, `Your ${r.type.toLowerCase()} request for order ${r.orderId} is now "${status}".`);
}

/* ---------- back-in-stock alerts, recently viewed, activity log ---------- */
export function requestStockAlert(slug: string, size: Size | undefined, contact: string) {
  return notifyStore.update((list) => [{ id: uid("ntf"), slug, size, contact: contact.trim(), createdAt: new Date().toISOString() }, ...list]);
}
export function trackRecentlyViewed(slug: string) {
  recentStore.update((list) => (list[0] === slug ? list : [slug, ...list.filter((s) => s !== slug)].slice(0, 12)));
}
export function logActivity(who: string, action: string) {
  activityStore.update((list) => [{ id: uid("act"), at: new Date().toISOString(), who, action }, ...list].slice(0, 200));
}

/* ---------- staff accounts (preview-only; replaced by backend roles) ---------- */
async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function addStaff(input: { name: string; email: string; password: string; role: StaffRole }): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (email === ADMIN_EMAIL || staffStore.getSnapshot().some((x) => x.email === email) || usersStore.getSnapshot().some((u) => u.email === email)) {
    return { ok: false, error: "That email is already in use." };
  }
  if (input.password.length < 8) return { ok: false, error: "Use a password of at least 8 characters." };
  const salt = uid("salt");
  const account: StaffAccount = {
    id: uid("stf"),
    name: input.name.trim(),
    email,
    role: input.role,
    salt,
    hash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  staffStore.update((list) => [...list, account]);
  usersStore.update((list) => [...list, { id: account.id, name: account.name, email, role: "admin", staffRole: account.role, createdAt: account.createdAt }]);
  return { ok: true };
}

export function removeStaff(id: string) {
  staffStore.update((list) => list.filter((x) => x.id !== id));
  usersStore.update((list) => list.filter((u) => u.id !== id));
}

export function setStaffRole(id: string, role: StaffRole) {
  staffStore.update((list) => list.map((x) => (x.id === id ? { ...x, role } : x)));
  usersStore.update((list) => list.map((u) => (u.id === id ? { ...u, staffRole: role } : u)));
}

/** Owner credentials first, then staff accounts. */
export async function signInAnyAdmin(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const owner = signInAdmin(email, password);
  if (owner.ok) return owner;
  const account = staffStore.getSnapshot().find((x) => x.email === email.trim().toLowerCase());
  if (!account || (await hashPassword(password, account.salt)) !== account.hash) return { ok: false, error: "Wrong email or password." };
  sessionStore.set(account.id);
  return { ok: true };
}
