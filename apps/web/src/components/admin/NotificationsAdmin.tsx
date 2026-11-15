"use client";

import Link from "next/link";
import { useState } from "react";
import {
  clearNotifications,
  kindLabels,
  kindPermission,
  markAllRead,
  markRead,
  NOTIFICATION_KINDS,
  notificationsStore,
  saveNotifySettings,
  useNotifySettings,
  type NotificationKind,
} from "@/lib/notifications";
import { can } from "@/lib/permissions";
import { useStore } from "@/lib/storage";
import { useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import type { StaffRole } from "@/lib/types";
import { btnOutline, btnPrimary, card, input, label } from "@/lib/ui";

const icon: Record<NotificationKind, string> = { order: "🛍", preorder: "⏳", request: "✂", review: "★", stock: "📦", enquiry: "✉", return: "↩" };
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function NotificationsAdmin() {
  const me = useCurrentUser();
  const role: StaffRole = me?.staffRole ?? "owner";
  const all = useStore(notificationsStore);
  const settings = useNotifySettings();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const items = all.filter((n) => can(role, kindPermission[n.kind]));
  const unread = items.filter((n) => !n.read).length;
  const canConfigure = can(role, "settings");

  const addEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setError("Enter a valid email address.");
    if (settings.emails.includes(v)) return setError("That email already receives updates.");
    saveNotifySettings({ emails: [...settings.emails, v] });
    setEmail("");
    setError("");
    showToast("Email added");
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Notifications</h2>
          <p className="mt-2 text-mist">What is happening on the shop. {unread > 0 ? `${unread} new.` : "You are all caught up."}</p>
        </div>
        <div className="flex gap-3">
          {unread > 0 && <button type="button" onClick={markAllRead} className={btnOutline}>Mark all read</button>}
          {items.length > 0 && <button type="button" onClick={() => window.confirm("Clear the whole list?") && clearNotifications()} className="text-sm text-mist underline-offset-4 hover:text-gold hover:underline">Clear</button>}
        </div>
      </div>

      {items.length === 0 ? (
        <div className={`${card} p-8 text-center`}>
          <p className="font-display text-2xl">Nothing yet</p>
          <p className="mt-2 text-mist">New orders, pre-orders, style requests, reviews, messages and low stock show up here as they happen.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => markRead(n.id)}
                className={`${card} flex items-start gap-4 p-4 transition-colors hover:border-gold ${n.read ? "opacity-70" : "border-gold/50"}`}
              >
                <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xl text-gold">{icon[n.kind]}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{n.title}</span>
                    <span className="text-xs text-mist">{when(n.at)}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-mist">{n.body}</span>
                </span>
                {!n.read && <span aria-label="Unread" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {canConfigure && (
        <section aria-labelledby="mail" className={`${card} space-y-6 p-5`}>
          <div>
            <h3 id="mail" className="font-display text-xl">Email updates</h3>
            <p className="mt-1 text-sm text-mist">
              These people get an email for each event you switch on. Sending real emails connects with the backend; the list and choices are saved now.
            </p>
          </div>
          <div>
            <p className={label}>Send to</p>
            <ul className="space-y-2">
              {settings.emails.map((m) => (
                <li key={m} className="flex items-center justify-between gap-3 text-sm">
                  <span>{m}</span>
                  <button type="button" onClick={() => saveNotifySettings({ emails: settings.emails.filter((x) => x !== m) })} className="text-mist underline-offset-4 hover:text-red-300 hover:underline">Remove</button>
                </li>
              ))}
              {settings.emails.length === 0 && <li className="text-sm text-mist">Nobody yet.</li>}
            </ul>
            <form onSubmit={addEmail} className="mt-3 flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="nt-email">Add an email</label>
              <input id="nt-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${input} max-w-xs`} />
              <button type="submit" className={btnPrimary}>Add</button>
            </form>
            {error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
          </div>
          <div>
            <p className={label}>Email me about</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {NOTIFICATION_KINDS.map((k) => (
                <li key={k}>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={settings.kinds[k]} onChange={(e) => saveNotifySettings({ kinds: { ...settings.kinds, [k]: e.target.checked } })} className="h-5 w-5 accent-gold" />
                    {kindLabels[k]}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
