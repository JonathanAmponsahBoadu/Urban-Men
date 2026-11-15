"use client";

// Admin notification feed + who gets emailed.
//
// PREVIEW: the feed works now (events from this browser). Sending real emails to the administrators, and push
// notifications to the app, is done by the backend (see apps/backend/ARCHITECTURE.md): the same events fire there.
import { createStore, useStore } from "@/lib/storage";
import type { Permission } from "@/lib/permissions";

export const NOTIFICATION_KINDS = ["order", "preorder", "request", "review", "stock", "enquiry", "return"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const kindLabels: Record<NotificationKind, string> = {
  order: "New orders",
  preorder: "New pre-orders",
  request: "Custom style requests",
  review: "New reviews to approve",
  stock: "Low or sold-out stock",
  enquiry: "Messages and corporate enquiries",
  return: "Return and exchange requests",
};

/** Which admin area a notification belongs to, so each role only sees what it can open. */
export const kindPermission: Record<NotificationKind, Permission> = {
  order: "orders",
  preorder: "orders",
  request: "requests",
  review: "reviews",
  stock: "inventory",
  enquiry: "inbox",
  return: "inbox",
};

export type AdminNotification = {
  id: string;
  at: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
};

export const notificationsStore = createStore<AdminNotification[]>("um.adminfeed", []);

export function adminNotify(kind: NotificationKind, title: string, body: string, href: string) {
  const item: AdminNotification = {
    id: `nt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    at: new Date().toISOString(),
    kind,
    title,
    body,
    href,
    read: false,
  };
  notificationsStore.update((list) => [item, ...list].slice(0, 200));
}

export const markAllRead = () => notificationsStore.update((list) => list.map((n) => ({ ...n, read: true })));
export const markRead = (id: string) => notificationsStore.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
export const clearNotifications = () => notificationsStore.set([]);

/** The two administrators and the root owner receive admin emails by default. */
export const DEFAULT_NOTIFY_EMAILS = ["kkwesi956@gmail.com", "mandyemefa@gmail.com", "nagbrand@gmail.com"];

export type NotifySettings = { emails: string[]; kinds: Record<NotificationKind, boolean> };
const defaultKinds = Object.fromEntries(NOTIFICATION_KINDS.map((k) => [k, true])) as Record<NotificationKind, boolean>;
export const notifySettingsStore = createStore<Partial<NotifySettings>>("um.notifysettings", {});

export function useNotifySettings(): NotifySettings {
  const saved = useStore(notifySettingsStore);
  return { emails: saved.emails ?? DEFAULT_NOTIFY_EMAILS, kinds: { ...defaultKinds, ...saved.kinds } };
}
export const saveNotifySettings = (patch: Partial<NotifySettings>) => notifySettingsStore.update((cur) => ({ ...cur, ...patch }));
