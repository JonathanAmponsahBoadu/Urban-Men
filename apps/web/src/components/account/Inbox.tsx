"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { inboxStore, useCurrentUser } from "@/lib/stores";
import { btnGhost, card } from "@/lib/ui";

export function Inbox() {
  const user = useCurrentUser();
  const all = useStore(inboxStore);
  const [open, setOpen] = useState<string | null>(null);
  if (!user) return null;
  const mine = all.filter((m) => m.userId === user.id);
  const unread = mine.filter((m) => !m.read).length;

  const toggle = (id: string) => {
    setOpen((cur) => (cur === id ? null : id));
    inboxStore.update((list) => list.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Inbox {unread > 0 && <span className="text-lg text-gold">({unread} new)</span>}</h2>
        {unread > 0 && (
          <button
            type="button"
            className={btnGhost}
            onClick={() => inboxStore.update((list) => list.map((m) => (m.userId === user.id ? { ...m, read: true } : m)))}
          >
            Mark all read
          </button>
        )}
      </div>
      {mine.length === 0 ? (
        <p className="mt-6 text-mist">No messages yet. Order updates and replies from us will appear here.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {mine.map((m) => (
            <li key={m.id} className={`${card} ${!m.read ? "border-gold/50" : ""}`}>
              <button type="button" onClick={() => toggle(m.id)} aria-expanded={open === m.id} className="flex w-full items-start gap-4 p-5 text-left">
                <span aria-hidden className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${m.read ? "bg-white/15" : "bg-gold"}`} />
                <span className="flex-1">
                  <span className={`block ${m.read ? "" : "font-semibold"}`}>{m.subject}</span>
                  <span className="text-sm text-mist">{m.from} · {formatDate(m.createdAt)}</span>
                </span>
              </button>
              {open === m.id && <p className="border-t border-white/10 px-5 py-4 text-ivory/90">{m.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
