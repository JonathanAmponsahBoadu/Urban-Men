import { type Area, roleOf, rolePermissions } from "./rbac";

/**
 * Alerts for the team (new orders, style requests, reviews, low stock) are sent only to staff who CHOSE them:
 * each person decides whether they get email, a phone notification, or both, and for which areas.
 * Nothing is sent to someone who has not opted in. The choice is stored on the staff user's metadata:
 *
 *   user.metadata.alerts = { email: boolean, push: boolean, areas: ["orders", ...], consented_at: ISO date }
 *
 * Pure functions only, so the rules are unit-tested without a database.
 */
export const ALERT_AREAS = ["orders", "requests", "reviews", "inventory"] as const satisfies readonly Area[];
export type AlertArea = (typeof ALERT_AREAS)[number];

export type AlertPrefs = { email: boolean; push: boolean; areas: AlertArea[]; consented_at?: string };

type UserLike = { id: string; email?: string | null; metadata?: Record<string, unknown> | null };

const isAlertArea = (v: unknown): v is AlertArea => (ALERT_AREAS as readonly unknown[]).includes(v);

/** The alert areas a person's role lets them follow (an inventory manager cannot subscribe to orders). */
export function allowedAreas(user: UserLike): AlertArea[] {
  const permitted = rolePermissions[roleOf(user)];
  return ALERT_AREAS.filter((a) => permitted.includes(a));
}

/** What the person chose, or undefined when they never made a choice (= no consent, nothing is sent). */
export function readPrefs(user: UserLike): AlertPrefs | undefined {
  const raw = user.metadata?.alerts as Partial<AlertPrefs> | undefined;
  if (!raw || typeof raw !== "object") return undefined;
  return {
    email: raw.email === true,
    push: raw.push === true,
    areas: Array.isArray(raw.areas) ? raw.areas.filter(isAlertArea) : [],
    consented_at: typeof raw.consented_at === "string" ? raw.consented_at : undefined,
  };
}

/** Cleans what a person submitted: booleans only, and only areas their role may follow. */
export function normalizePrefs(user: UserLike, input: { email?: unknown; push?: unknown; areas?: unknown }, now = new Date()): AlertPrefs {
  const allowed = allowedAreas(user);
  const areas = Array.isArray(input.areas) ? [...new Set(input.areas.filter(isAlertArea))].filter((a) => allowed.includes(a)) : [];
  return { email: input.email === true, push: input.push === true, areas, consented_at: now.toISOString() };
}

/** Who gets an alert for this area: only staff who opted in to it, by the channels they chose. */
export function recipientsFor(users: UserLike[], area: AlertArea): { emails: string[]; pushUserIds: string[] } {
  const emails: string[] = [];
  const pushUserIds: string[] = [];
  for (const user of users) {
    const prefs = readPrefs(user);
    if (!prefs || !prefs.areas.includes(area)) continue;
    if (!allowedAreas(user).includes(area)) continue; // role changed since they opted in
    if (prefs.email && user.email) emails.push(user.email.trim().toLowerCase());
    if (prefs.push) pushUserIds.push(user.id);
  }
  return { emails, pushUserIds };
}
