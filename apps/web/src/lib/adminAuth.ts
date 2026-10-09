// PREVIEW-ONLY admin credentials.
//
// These live in the app's code, so anyone who inspects the site can read them: they only keep
// casual visitors out of the admin screens. They are replaced by real server-side accounts and
// roles when the backend is connected. Never reuse a real password here.
//
// Override without editing code by setting these in apps/web/.env.local (gitignored):
//   NEXT_PUBLIC_ADMIN_EMAIL=you@example.com
//   NEXT_PUBLIC_ADMIN_PASSWORD=something-simple
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin@urbanmen.demo").toLowerCase();
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "UrbanMen@2026";

export function checkAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}
