"use client";

// FRONTEND-ONLY data layer. Every store persists to this browser's localStorage,
// standing in for the backend (accounts, orders, reviews, inbox, admin edits).
// Nothing here is secure or shared between devices; replace with API calls later.
import type { Product } from "@/data/products";
import { hashPassword, INVITED_ADMINS, isRootEmail, rootEmail, rootStore, verifyRoot } from "@/lib/adminAuth";
import { adminNotify } from "@/lib/notifications";
import { createStore, uid, useStore } from "@/lib/storage";
import { clearToken, setToken } from "@/lib/session";
import { API_URL, backendOn } from "@/lib/api";
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
  StockLogEntry,
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
export const stockLogStore = createStore<StockLogEntry[]>("um.stocklog", []);
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
  const user = users.find((u) => u.id === id) ?? null;
  if (user && (user.id === "usr_admin" || isRootEmail(user.email))) {
    const currentRoot = rootEmail();
    if (user.email === "admin@urbanmen.demo" && currentRoot !== "admin@urbanmen.demo") {
      return { ...user, email: currentRoot };
    }
  }
  return user;
}

export function signUp(input: { name: string; email: string; phone?: string }): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (isRootEmail(email)) return { ok: false, error: "That email is reserved. Please use a different one." };
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

export async function signIn(emailRaw: string, password?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = emailRaw.trim().toLowerCase();

  // 1. Root owner
  if (isRootEmail(email)) {
    if (password && !(await verifyRoot(email, password))) {
      return { ok: false, error: "Wrong password." };
    }
    signInRoot(email);
    return { ok: true };
  }

  // 2. Staff members
  ensureInvitedAdmins();
  const staff = staffStore.getSnapshot().find((x) => x.email === email);
  if (staff) {
    if (password) {
      if (staff.pending) {
        if (password.length < 8) return { ok: false, error: "Choose a password of at least 8 characters; it becomes your password." };
        const salt = uid("salt");
        const hash = await hashPassword(password, salt);
        staffStore.update((list) => list.map((x) => (x.id === staff.id ? { ...x, salt, hash, pending: false } : x)));
      } else if (staff.hash && (await hashPassword(password, staff.salt)) !== staff.hash) {
        return { ok: false, error: "Wrong password." };
      }
    }
    sessionStore.set(staff.id);
    return { ok: true };
  }

  // 3. Shopper / Customer
  const user = usersStore.getSnapshot().find((u) => u.email === email);
  if (!user) return { ok: false, error: "We could not find an account with that email. Create one first." };
  sessionStore.set(user.id);
  return { ok: true };
}

/** Sign in the root owner (after verifyRoot passed). Preview-only; the backend replaces this. */
function signInRoot(overrideEmail?: string) {
  const email = (overrideEmail ?? rootEmail()).toLowerCase();
  const currentRoot = email === "admin@urbanmen.demo" ? rootEmail() : email;

  // Clean up any stale admin@urbanmen.demo in usersStore and set the root owner
  usersStore.update((list) => {
    const cleaned = list.filter((u) => u.email !== "admin@urbanmen.demo" && u.id !== "usr_admin");
    const owner: User = {
      id: "usr_admin",
      name: "Store Owner",
      email: currentRoot,
      role: "admin",
      staffRole: "owner",
      createdAt: new Date().toISOString(),
    };
    return [owner, ...cleaned];
  });

  // Also clear rootStore if it previously saved the old demo placeholder
  const rootSaved = rootStore.getSnapshot();
  if (rootSaved?.email === "admin@urbanmen.demo") {
    rootStore.set(null);
  }

  sessionStore.set("usr_admin");
}

/** Signs in an admin/staff account via OAuth (e.g. Google) without requiring a password. */
export function signInStaffOAuth(email: string): boolean {
  const norm = email.trim().toLowerCase();
  if (isRootEmail(norm)) {
    signInRoot(norm);
    return true;
  }
  ensureInvitedAdmins();
  const staff = staffStore.getSnapshot().find((x) => x.email === norm);
  if (staff) {
    sessionStore.set(staff.id);
    return true;
  }
  return false;
}

/**
 * Google sign-up / sign-in. PREVIEW: asks for the Gmail address and trusts it. The real flow (Google's own
 * consent screen, via the backend's Google auth provider) replaces this once the backend and keys exist.
 */
export function signInWithGoogle(input: { email: string; name?: string }): { ok: true; created: boolean } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid Gmail address." };
  if (isRootEmail(email)) {
    signInRoot(email);
    return { ok: true, created: false };
  }
  ensureInvitedAdmins();
  const staff = staffStore.getSnapshot().find((x) => x.email === email);
  if (staff) {
    sessionStore.set(staff.id);
    return { ok: true, created: false };
  }
  const existing = usersStore.getSnapshot().find((u) => u.email === email);
  if (existing) {
    sessionStore.set(existing.id);
    return { ok: true, created: false };
  }
  const user: User = {
    id: uid("usr"),
    name: input.name?.trim() || email.split("@")[0],
    email,
    role: "shopper",
    provider: "google",
    createdAt: new Date().toISOString(),
  };
  usersStore.update((u) => [...u, user]);
  sessionStore.set(user.id);
  sendMessage(user.id, "Urban Men", "Welcome to Urban Men", "Thank you for joining us. Browse the collection, save favourites to your wishlist, or request a style made just for you.");
  return { ok: true, created: true };
}

export function signOut() {
  clearToken();
  sessionStore.set(null);
}

export function updateProfile(userId: string, patch: Partial<Pick<User, "name" | "phone" | "address">>) {
  usersStore.update((list) => list.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
}

export function updateNotifyPrefs(userId: string, patch: Partial<NonNullable<User["notifyPrefs"]>>) {
  usersStore.update((list) => list.map((u) => (u.id === userId ? { ...u, notifyPrefs: { orderEmail: true, newsEmail: false, ...u.notifyPrefs, ...patch } } : u)));
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
  extra?: {
    payment?: Payment;
    delivery?: Delivery;
    paidNow?: number;
    balance?: number;
    readyBy?: string;
    /** set when the shop backend already took the order: it keeps the stock and alerts the team itself */
    remote?: { id: string; displayId: number; total: number };
  },
): Order {
  const allPriced = lines.every((l) => l.price !== undefined);
  const subtotal = allPriced ? lines.reduce((s, l) => s + (l.price ?? 0) * l.qty, 0) : undefined;
  const discount = subtotal !== undefined && voucher ? Math.round(subtotal * voucher.percentOff) / 100 : undefined;
  const remote = extra?.remote;
  const order: Order = {
    id: remote ? `UM-${String(remote.displayId).padStart(4, "0")}` : `UM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    ...(remote ? { serverId: remote.id } : {}),
    userId: user.id,
    createdAt: new Date().toISOString(),
    lines,
    status: "Awaiting confirmation",
    total: remote ? remote.total : subtotal !== undefined ? Math.round((subtotal - (discount ?? 0)) * 100) / 100 : undefined,
    voucher: voucher?.code,
    discount,
    payment: extra?.payment,
    delivery: extra?.delivery,
    ...(extra?.balance ? { paidNow: extra.paidNow, balance: extra.balance } : {}),
    ...(extra?.readyBy ? { readyBy: extra.readyBy } : {}),
  };
  ordersStore.update((list) => [order, ...list]);
  if (remote) {
    sendMessage(user.id, "Urban Men", `We received your order ${order.id}`, "Thank you! We will confirm sizes, price and delivery with you shortly. You can follow the status under Orders.");
    return order;
  }
  {
    const pre = lines.some((l) => l.preorder);
    const who = extra?.delivery?.name ?? user.name;
    adminNotify(pre ? "preorder" : "order", `${pre ? "New pre-order" : "New order"} ${order.id}`, `${who} ordered ${lines.reduce((n, l) => n + l.qty, 0)} item(s)${order.total !== undefined ? `, GH₵ ${order.total.toFixed(2)}` : ""}.`, "/admin/orders");
  }
  // take the units out of stock (tracked cumulatively so repeat lines of one product add up)
  const stockNow = new Map<string, Product["stock"]>();
  for (const l of lines) {
    const p = products.find((x) => x.slug === l.slug);
    if (!p || l.preorder) continue; // pre-orders are made to order: no stock to take out
    const current = stockNow.get(l.slug) ?? p.stock;
    stockNow.set(l.slug, { ...current, [l.size]: Math.max(0, current[l.size] - l.qty) });
  }
  for (const [slug, stock] of stockNow) {
    const p = products.find((x) => x.slug === slug);
    const low = (Object.keys(stock) as Size[]).filter((s) => stock[s] <= 3);
    if (p && low.length) adminNotify("stock", `Low stock: ${p.localName ?? p.name}`, `${low.map((s) => `${s} (${stock[s]})`).join(", ")} running low.`, "/admin/inventory");
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
  adminNotify("review", `New ${rating}-star review`, `${user.name}: ${body.trim().slice(0, 80)}`, "/admin/reviews");
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
    adminNotify("request", `Style request ${req.id}`, `${user.name}: ${data.description.replace(/\s+/g, " ").slice(0, 90)}`, "/admin/requests");
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
  adminNotify("enquiry", data.message.startsWith("CORPORATE ORDER ENQUIRY") ? "Corporate order enquiry" : "New message", `${data.name}: ${data.message.replace(/\s+/g, " ").slice(0, 90)}`, "/admin/inbox");
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
  adminNotify("return", `${data.type} request ${req.id}`, `${user.name} asked for a ${data.type.toLowerCase()} on order ${data.orderId}.`, "/admin/inbox");
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

/* ---------- staff accounts ---------- */
export async function addStaff(input: { name: string; email: string; password: string; role: StaffRole }): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  if (input.role === "owner") return { ok: false, error: "Only the root owner has the owner role." };
  if (isRootEmail(email) || staffStore.getSnapshot().some((x) => x.email === email) || usersStore.getSnapshot().some((u) => u.email === email)) {
    return { ok: false, error: "That email is already in use." };
  }
  if (input.password.length < 8) return { ok: false, error: "Use a password of at least 8 characters." };
  const salt = uid("salt");
  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  const account: StaffAccount = {
    id: uid("stf"),
    name: input.name.trim(),
    email,
    role: input.role,
    salt,
    hash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };

  // Try to create the user on the backend as well (best-effort; localStorage is the fallback)
  if (backendOn) {
    try {
      // 1. Register auth identity
      await fetch(`${API_URL}/auth/user/emailpass/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: input.password }),
        cache: "no-store",
      });
      // 2. Authenticate to get a token for creating the user record
      const authRes = await fetch(`${API_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: input.password }),
        cache: "no-store",
      });
      const authJson = (await authRes.json().catch(() => undefined)) as { token?: string } | undefined;
      if (authRes.ok && authJson?.token) {
        // 3. Create the user record in Medusa
        await fetch(`${API_URL}/admin/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authJson.token}` },
          body: JSON.stringify({ email, first_name: firstName, last_name: rest.join(" ") || undefined }),
          cache: "no-store",
        });
      }
    } catch {
      // Backend unreachable — the localStorage record below is the fallback
    }
  }

  staffStore.update((list) => [...list, account]);
  usersStore.update((list) => [...list, { id: account.id, name: account.name, email, role: "admin", staffRole: account.role, createdAt: account.createdAt }]);
  return { ok: true };
}

const invitesSeededStore = createStore<boolean>("um.invites.seeded", false);

/** Adds the named administrators as pending admin accounts, once. Removing one afterwards sticks. */
export function ensureInvitedAdmins() {
  if (invitesSeededStore.getSnapshot()) return;
  invitesSeededStore.set(true);
  for (const a of INVITED_ADMINS) {
    const email = a.email.toLowerCase();
    if (isRootEmail(email) || staffStore.getSnapshot().some((x) => x.email === email)) continue;
    const account: StaffAccount = { id: uid("stf"), name: a.name, email, role: "admin", salt: "", hash: "", pending: true, createdAt: new Date().toISOString() };
    staffStore.update((list) => [...list, account]);
    usersStore.update((list) => (list.some((u) => u.email === email) ? list : [...list, { id: account.id, name: account.name, email, role: "admin", staffRole: "admin", createdAt: account.createdAt }]));
  }
}

/** Nobody can edit or remove the root owner except the root owner themselves. */
const isRootAccount = (id: string) => isRootEmail(usersStore.getSnapshot().find((u) => u.id === id)?.email ?? staffStore.getSnapshot().find((x) => x.id === id)?.email);

export function removeStaff(id: string): boolean {
  if (isRootAccount(id)) return false;
  staffStore.update((list) => list.filter((x) => x.id !== id));
  usersStore.update((list) => list.filter((u) => u.id !== id));
  return true;
}

export function setStaffRole(id: string, role: StaffRole): boolean {
  if (isRootAccount(id) || role === "owner") return false;
  staffStore.update((list) => list.map((x) => (x.id === id ? { ...x, role } : x)));
  usersStore.update((list) => list.map((u) => (u.id === id ? { ...u, staffRole: role } : u)));
  return true;
}

export function grantUserStaffRole(userId: string, role: StaffRole): boolean {
  const users = usersStore.getSnapshot();
  const target = users.find((u) => u.id === userId);
  if (!target || isRootEmail(target.email) || role === "owner") return false;

  usersStore.update((list) =>
    list.map((u) => (u.id === userId ? { ...u, role: "admin" as const, staffRole: role } : u))
  );

  staffStore.update((list) => {
    const existing = list.find((x) => x.id === userId || x.email === target.email);
    if (existing) {
      return list.map((x) => (x.id === existing.id ? { ...x, role } : x));
    }
    return [
      ...list,
      {
        id: target.id,
        name: target.name,
        email: target.email,
        role,
        salt: "",
        hash: "",
        pending: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });
  return true;
}

export function demoteStaffToCustomer(id: string): boolean {
  if (isRootAccount(id)) return false;
  const staff = staffStore.getSnapshot().find((x) => x.id === id);
  staffStore.update((list) => list.filter((x) => x.id !== id));
  usersStore.update((list) =>
    list.map((u) => (u.id === id || (staff && u.email === staff.email) ? { ...u, role: "shopper" as const, staffRole: undefined } : u))
  );
  return true;
}

/** Owner credentials first; for all other staff, authenticate against the Railway backend. */
export async function signInAnyAdmin(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalised = email.trim().toLowerCase();

  // 1. Root owner — authenticate against Railway backend, with local verifyRoot fallback
  if (isRootEmail(normalised)) {
    if (backendOn) {
      try {
        const authRes = await fetch(`${API_URL}/auth/user/emailpass`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalised, password }),
          cache: "no-store",
        });
        const authJson = (await authRes.json().catch(() => undefined)) as { token?: string } | undefined;
        if (authRes.ok && authJson?.token) {
          setToken(authJson.token);
          signInRoot(normalised);
          return { ok: true };
        }
      } catch {
        // network issue — fall through to verifyRoot
      }
    }
    if (await verifyRoot(normalised, password)) {
      signInRoot(normalised);
      return { ok: true };
    }
    return { ok: false, error: "Wrong email or password." };
  }

  // 2. All other staff — try the Railway Medusa backend first
  if (backendOn) {
    try {
      const authRes = await fetch(`${API_URL}/auth/user/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalised, password }),
        cache: "no-store",
      });
      const authJson = (await authRes.json().catch(() => undefined)) as { token?: string; message?: string } | undefined;

      if (authRes.ok && authJson?.token) {
        const jwt = authJson.token;
        setToken(jwt);

        // Fetch the user's details to set the correct staffRole
        let staffRole: import("@/lib/types").StaffRole = "support";
        try {
          const meRes = await fetch(`${API_URL}/admin/users/me`, {
            headers: { Authorization: `Bearer ${jwt}` },
            cache: "no-store",
          });
          const meJson = (await meRes.json().catch(() => undefined)) as { user?: { email?: string; metadata?: Record<string, unknown> } } | undefined;
          if (meRes.ok && meJson?.user) {
            const remoteEmail = (meJson.user.email ?? normalised).toLowerCase();
            const storedRole = meJson.user.metadata?.role;
            if (typeof storedRole === "string" && ["admin", "manager", "inventory", "support"].includes(storedRole)) {
              staffRole = storedRole as import("@/lib/types").StaffRole;
            } else if (INVITED_ADMINS.some((a) => a.email.toLowerCase() === remoteEmail)) {
              staffRole = "admin";
            }
          }
        } catch {
          // Could not fetch /admin/users/me — fall back to INVITED_ADMINS list
          const isInvited = INVITED_ADMINS.some((a) => a.email.toLowerCase() === normalised);
          staffRole = isInvited ? "admin" : "support";
        }

        // Upsert a local user record so the UI session works
        const existingUser = usersStore.getSnapshot().find((u) => u.email === normalised);
        const userId = existingUser?.id ?? uid("stf");
        const name = existingUser?.name ?? INVITED_ADMINS.find((a) => a.email.toLowerCase() === normalised)?.name ?? normalised.split("@")[0];
        const user: import("@/lib/types").User = {
          id: userId,
          name,
          email: normalised,
          role: "admin",
          staffRole,
          createdAt: existingUser?.createdAt ?? new Date().toISOString(),
        };
        usersStore.update((list) =>
          list.some((u) => u.email === normalised) ? list.map((u) => (u.email === normalised ? user : u)) : [...list, user],
        );

        // Upsert a staffStore entry so the session resolves to this user
        const existingStaff = staffStore.getSnapshot().find((x) => x.email === normalised);
        if (!existingStaff) {
          staffStore.update((list) => [...list, { id: userId, name, email: normalised, role: staffRole, salt: "", hash: "", pending: false, createdAt: user.createdAt }]);
        } else {
          staffStore.update((list) => list.map((x) => (x.email === normalised ? { ...x, role: staffRole, pending: false } : x)));
        }

        sessionStore.set(userId);
        return { ok: true };
      }

      // Backend responded with an error (401 = wrong credentials, 404 = unknown user, etc.)
      const serverMessage = authJson?.message;
      if (authRes.status === 401) {
        return { ok: false, error: "Wrong email or password." };
      }
      if (authRes.status !== 0 && authRes.status < 500) {
        return { ok: false, error: serverMessage ?? "Wrong email or password." };
      }
      // Server error — fall through to local fallback below
    } catch {
      // Network error — fall through to local fallback
    }
  }

  // 3. Local fallback — used when backend is unreachable (backendOn === false or network error)
  ensureInvitedAdmins();
  const account = staffStore.getSnapshot().find((x) => x.email === normalised);
  if (!account) return { ok: false, error: "Wrong email or password." };
  if (account.pending) {
    if (password.length < 8) return { ok: false, error: "This is your first sign-in. Choose a password of at least 8 characters; it becomes your password." };
    const salt = uid("salt");
    const hash = await hashPassword(password, salt);
    staffStore.update((list) => list.map((x) => (x.id === account.id ? { ...x, salt, hash, pending: false } : x)));
  } else if (account.hash && (await hashPassword(password, account.salt)) !== account.hash) {
    return { ok: false, error: "Wrong email or password." };
  }
  sessionStore.set(account.id);
  return { ok: true };
}
