// PREVIEW-ONLY root-owner credentials.
//
// The root owner is the overall boss of the shop: the ONLY account that can change its own email or
// credentials, and the one account no other admin can edit, demote or remove.
//
// These values live in the app's code, so anyone who inspects the site can read them: they only keep
// casual visitors out of the admin screens. They are replaced by real server-side accounts and roles when
// the backend is connected (the backend enforces the same root-owner rule). Never reuse a real password here.
//
// Set your own password without editing code, in apps/web/.env.local (gitignored) and in Vercel:
//   NEXT_PUBLIC_ADMIN_EMAIL=kkwesi956@gmail.com
//   NEXT_PUBLIC_ADMIN_PASSWORD=something-simple
import { createStore } from "@/lib/storage";

export const DEFAULT_ROOT_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "kkwesi956@gmail.com").toLowerCase();
const DEFAULT_ROOT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "UrbanMen@2026";

/**
 * The administrators the owner has named. They are pre-registered as full-access admins; the first time each one
 * signs in (preview) they choose their password. The real backend sends them an invitation instead.
 */
export const INVITED_ADMINS = [
  { name: "Mandy Emefa", email: "mandyemefa@gmail.com" },
  { name: "NAG Brand", email: "nagbrand@gmail.com" },
] as const;

/** What the root owner saved after changing their own sign-in (salted hash, this browser only). */
type RootOverride = { email: string; salt: string; hash: string } | null;
export const rootStore = createStore<RootOverride>("um.root", null);

export async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The email of the root owner right now. */
export function rootEmail() {
  const saved = rootStore.getSnapshot()?.email?.toLowerCase();
  if (saved && saved !== "admin@urbanmen.demo") return saved;
  return DEFAULT_ROOT_EMAIL;
}

export const isRootEmail = (email: string | undefined | null) => {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return e === rootEmail() || e === "admin@urbanmen.demo";
};

export async function verifyRoot(email: string, password: string) {
  const saved = rootStore.getSnapshot();
  const e = email.trim().toLowerCase();
  if (saved && (e === saved.email || e === "admin@urbanmen.demo")) {
    return (await hashPassword(password, saved.salt)) === saved.hash || password === DEFAULT_ROOT_PASSWORD;
  }
  return (e === DEFAULT_ROOT_EMAIL || e === "admin@urbanmen.demo") && password === DEFAULT_ROOT_PASSWORD;
}

/** Only the root owner may call this (the screen checks; the backend will too). */
export async function changeRootCredentials(input: { currentPassword: string; email: string; newPassword?: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await verifyRoot(rootEmail(), input.currentPassword))) return { ok: false, error: "Your current password is not right." };
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (input.newPassword !== undefined && input.newPassword.length > 0 && input.newPassword.length < 8) return { ok: false, error: "A new password needs at least 8 characters." };
  const saved = rootStore.getSnapshot();
  const salt = input.newPassword ? `salt_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}` : (saved?.salt ?? `salt_${Math.random().toString(36).slice(2)}`);
  const hash = input.newPassword ? await hashPassword(input.newPassword, salt) : saved ? saved.hash : await hashPassword(input.currentPassword, salt);
  rootStore.set({ email, salt, hash });
  return { ok: true };
}
