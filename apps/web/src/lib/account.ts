"use client";

// Customer accounts on the shop backend: email + password, and "Continue with Google".
// Shoppers never have to sign in to buy. The backend knows who the customer is; this device keeps a local
// copy of the profile (plus saved addresses, MoMo numbers and measurements, which are still stored on this device).
import { ApiError, backendOn, storeApi } from "@/lib/api";
import { clearToken, getToken, readJwt, setToken } from "@/lib/session";
import { isRootEmail } from "@/lib/adminAuth";
import { sendMessage, sessionStore, signInAnyAdmin, staffStore, usersStore } from "@/lib/stores";
import type { User } from "@/lib/types";

type Customer = { id: string; email: string; first_name?: string | null; last_name?: string | null; phone?: string | null; created_at?: string };
type Result = { ok: true; created?: boolean } | { ok: false; error: string };

const NEXT_KEY = "um.signin.next";

/** Accounts are kept on the server when the backend is connected; otherwise the preview accounts in this browser are used. */
export const accountsOnServer = backendOn;

// show the server's own wording when it is meant for customers (validation, network), a plain fallback otherwise
const fail = (e: unknown, fallback: string): Result => ({
  ok: false,
  error: e instanceof ApiError && e.message && (e.status === 0 || e.status < 500) && e.status !== 401 ? e.message : fallback,
});

/** Keeps the device's copy of the profile in step with the server's customer, and signs them in here. */
function adopt(customer: Customer, provider?: "google"): { created: boolean } {
  const existing = usersStore.getSnapshot().find((u) => u.id === customer.id);
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() || customer.email.split("@")[0];
  const user: User = {
    ...existing,
    id: customer.id,
    name,
    email: customer.email.toLowerCase(),
    phone: customer.phone ?? existing?.phone,
    role: "shopper",
    provider: provider ?? existing?.provider,
    createdAt: existing?.createdAt ?? customer.created_at ?? new Date().toISOString(),
  };
  usersStore.update((list) => (existing ? list.map((u) => (u.id === user.id ? user : u)) : [...list, user]));
  sessionStore.set(user.id);
  if (!existing) {
    sendMessage(user.id, "Urban Men", "Welcome to Urban Men", "Thank you for joining us. Browse the collection, save favourites to your wishlist, or request a style made just for you.");
  }
  return { created: !existing };
}

const staffEmail = (email: string) => isRootEmail(email) || staffStore.getSnapshot().some((s) => s.email === email);

async function createCustomer(token: string, input: { email: string; first_name?: string; last_name?: string; phone?: string }) {
  const { customer } = await storeApi<{ customer: Customer }>("/store/customers", { method: "POST", token, body: input });
  return customer;
}

export async function registerAccount(input: { name: string; email: string; phone?: string; password: string }): Promise<Result> {
  const email = input.email.trim().toLowerCase();
  const [first, ...rest] = input.name.trim().split(/\s+/);
  try {
    const { token: registration } = await storeApi<{ token: string }>("/auth/customer/emailpass/register", {
      method: "POST",
      body: { email, password: input.password },
    });
    await createCustomer(registration, { email, first_name: first, last_name: rest.join(" ") || undefined, phone: input.phone?.trim() || undefined });
    // sign in to get the full token (the registration token has no customer attached yet)
    const { token } = await storeApi<{ token: string }>("/auth/customer/emailpass", { method: "POST", body: { email, password: input.password } });
    setToken(token);
    const { customer } = await storeApi<{ customer: Customer }>("/store/customers/me", { auth: true });
    return { ok: true, created: adopt(customer).created };
  } catch (e) {
    if (e instanceof ApiError && /already exists/i.test(e.message)) {
      return { ok: false, error: "An account with that email already exists. Try signing in." };
    }
    return fail(e, "We could not create your account. Please try again.");
  }
}

export async function loginAccount(emailRaw: string, password: string): Promise<Result> {
  const email = emailRaw.trim().toLowerCase();

  // Root or staff accounts sign in with their staff permissions
  if (isRootEmail(email) || staffStore.getSnapshot().some((s) => s.email === email)) {
    const adminRes = await signInAnyAdmin(email, password);
    if (adminRes.ok) return { ok: true };
    return { ok: false, error: adminRes.error };
  }

  try {
    const { token } = await storeApi<{ token: string }>("/auth/customer/emailpass", { method: "POST", body: { email, password } });
    setToken(token);
    const { customer } = await storeApi<{ customer: Customer }>("/store/customers/me", { auth: true });
    adopt(customer);
    return { ok: true };
  } catch (e) {
    clearToken();
    if (e instanceof ApiError && e.status === 401) return { ok: false, error: "That email and password do not match an account. Check them, or create an account." };
    return fail(e, "We could not sign you in. Please try again.");
  }
}

/** Step 1 of Google sign-in: ask the backend for Google's consent-screen address and go there. */
export async function startGoogle(next: string): Promise<Result> {
  try {
    const res = await storeApi<{ location?: string }>("/auth/customer/google", { method: "POST", body: {} });
    if (!res.location) return { ok: false, error: "Google sign-in is not switched on yet." };
    try {
      window.sessionStorage.setItem(NEXT_KEY, next);
    } catch {
      /* the customer lands on their account page instead */
    }
    window.location.assign(res.location);
    return { ok: true };
  } catch (e) {
    return fail(e, "We could not reach Google sign-in. Please try again.");
  }
}

/** Where to send the customer after Google sign-in (set by startGoogle). */
export function takeNext(): string {
  try {
    const next = window.sessionStorage.getItem(NEXT_KEY);
    window.sessionStorage.removeItem(NEXT_KEY);
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  } catch {
    return "/account";
  }
}

/** Step 2 of Google sign-in, on /auth/google/callback: Google sent the customer back with ?code and ?state. */
export async function finishGoogle(search: string): Promise<Result> {
  try {
    let { token } = await storeApi<{ token: string }>(`/auth/customer/google/callback${search}`, { method: "POST", body: {} });
    const claims = readJwt(token);
    if (!claims.actor_id) {
      // first time with Google: create the customer from the Google profile, then get a token that includes them
      const profile = (claims.user_metadata ?? {}) as Record<string, unknown>;
      const email = String(profile.email ?? "").toLowerCase();
      if (!email) return { ok: false, error: "Google did not share an email address with us, so we could not create your account." };
      if (staffEmail(email)) return { ok: false, error: "That is a staff account. Please use the admin sign-in." };
      const first = String(profile.given_name ?? "").trim() || String(profile.name ?? "").trim().split(/\s+/)[0] || undefined;
      const last = String(profile.family_name ?? "").trim() || String(profile.name ?? "").trim().split(/\s+/).slice(1).join(" ") || undefined;
      await createCustomer(token, { email, first_name: first, last_name: last });
      ({ token } = await storeApi<{ token: string }>("/auth/token/refresh", { method: "POST", token }));
    }
    setToken(token);
    const { customer } = await storeApi<{ customer: Customer }>("/store/customers/me", { auth: true });
    return { ok: true, created: adopt(customer, "google").created };
  } catch (e) {
    clearToken();
    return fail(e, "Google sign-in did not finish. Please try again.");
  }
}

export function signOutAccount() {
  clearToken();
}

/** Tell the backend what email updates this customer wants (best effort; the device copy is the one shown). */
export async function saveNotifyPrefsRemote(prefs: { orderEmail?: boolean; newsEmail?: boolean }) {
  if (!backendOn || !getToken()) return;
  try {
    await storeApi("/store/customers/me/notification-preferences", {
      method: "POST",
      auth: true,
      body: { order_email: prefs.orderEmail, news_email: prefs.newsEmail },
    });
  } catch {
    /* kept on this device; retried the next time the customer changes it */
  }
}
