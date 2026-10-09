"use client";

import { useState } from "react";
import { useAllProducts } from "@/components/CatalogueProvider";
import { downloadCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { contactMessagesStore, logActivity, notifyStore, returnsStore, setReturnStatus, subscribersStore, useCurrentUser } from "@/lib/stores";
import { RETURN_STATUSES, type ReturnStatus } from "@/lib/types";
import { btnGhost, btnOutline, card, input } from "@/lib/ui";

type Tab = "messages" | "alerts" | "returns" | "subscribers";

export function InboxAdmin() {
  const me = useCurrentUser();
  const messages = useStore(contactMessagesStore);
  const alerts = useStore(notifyStore);
  const returns = useStore(returnsStore);
  const subscribers = useStore(subscribersStore);
  const products = useAllProducts();
  const [tab, setTab] = useState<Tab>("messages");
  const who = me?.name ?? "Admin";

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "messages", label: "Messages", n: messages.filter((m) => !m.handled).length },
    { id: "alerts", label: "Back-in-stock", n: alerts.length },
    { id: "returns", label: "Returns", n: returns.filter((r) => r.status === "New").length },
    { id: "subscribers", label: "Subscribers", n: subscribers.length },
  ];

  const waLink = (contact: string, text: string) => {
    const d = contact.replace(/\D/g, "");
    return /^0\d{9}$/.test(contact.replace(/[\s-]/g, "")) ? `https://wa.me/233${d.slice(1)}?text=${encodeURIComponent(text)}` : undefined;
  };

  return (
    <div>
      <h2 className="font-display text-3xl">Inbox &amp; returns</h2>
      <div role="tablist" aria-label="Inbox sections" className="mt-6 flex gap-2 overflow-x-auto border-b border-white/10">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === t.id ? "border-gold text-gold" : "border-transparent text-mist hover:text-ivory"}`}>
            {t.label} {t.n > 0 && <span className="ml-1 rounded-full bg-gold px-2 text-xs font-bold text-navy">{t.n}</span>}
          </button>
        ))}
      </div>

      <div className="pt-8">
        {tab === "messages" &&
          (messages.length === 0 ? (
            <p className="text-mist">No messages from the contact form yet.</p>
          ) : (
            <ul className="space-y-4">
              {messages.map((m) => (
                <li key={m.id} className={`${card} p-5 ${m.handled ? "opacity-60" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-mist">{m.contact} · {formatDate(m.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {waLink(m.contact, `Hello ${m.name}, this is Urban Men replying to your message.`) && <a href={waLink(m.contact, `Hello ${m.name}, this is Urban Men replying to your message.`)} className="text-gold underline-offset-4 hover:underline">Reply on WhatsApp</a>}
                      {m.contact.includes("@") && <a href={`mailto:${m.contact}`} className="text-gold underline-offset-4 hover:underline">Reply by email</a>}
                      <button type="button" className={btnGhost} onClick={() => { contactMessagesStore.update((l) => l.map((x) => (x.id === m.id ? { ...x, handled: !x.handled } : x))); logActivity(who, `marked a message from ${m.name} as ${m.handled ? "open" : "handled"}`); }}>
                        {m.handled ? "Reopen" : "Mark handled"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-ivory/90">{m.message}</p>
                </li>
              ))}
            </ul>
          ))}

        {tab === "alerts" &&
          (alerts.length === 0 ? (
            <p className="text-mist">No back-in-stock requests yet. They appear when a shopper asks to be told about a sold-out size.</p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => {
                const p = products.find((x) => x.slug === a.slug);
                return (
                  <li key={a.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
                    <span>
                      <span className="font-semibold">{p?.name ?? a.slug}</span>{a.size ? ` · size ${a.size}` : ""}
                      <span className="block text-sm text-mist">{a.contact} · {formatDate(a.createdAt)}</span>
                    </span>
                    <button type="button" className={btnGhost} onClick={() => notifyStore.update((l) => l.filter((x) => x.id !== a.id))}>Done</button>
                  </li>
                );
              })}
            </ul>
          ))}

        {tab === "returns" &&
          (returns.length === 0 ? (
            <p className="text-mist">No return or exchange requests yet.</p>
          ) : (
            <ul className="space-y-4">
              {returns.map((r) => (
                <li key={r.id} className={`${card} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{r.type} {r.id} · order {r.orderId}</p>
                      <p className="text-sm text-mist">{r.userName} · {formatDate(r.createdAt)}</p>
                    </div>
                    <label className="text-xs uppercase tracking-[0.2em] text-mist">
                      Status
                      <select value={r.status} onChange={(e) => { setReturnStatus(r.id, e.target.value as ReturnStatus); logActivity(who, `set ${r.type.toLowerCase()} ${r.id} to ${e.target.value}`); }} className={`${input} mt-1 w-40 py-1.5`}>
                        {RETURN_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                  </div>
                  <p className="mt-3">{r.reason}{r.wantedSize ? ` · wants size ${r.wantedSize}` : ""}</p>
                  {r.details && <p className="mt-1 text-mist">{r.details}</p>}
                </li>
              ))}
            </ul>
          ))}

        {tab === "subscribers" && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-mist">{subscribers.length} newsletter sign-up{subscribers.length === 1 ? "" : "s"}.</p>
              {subscribers.length > 0 && <button type="button" className={btnOutline} onClick={() => downloadCsv("subscribers.csv", [["email", "joined"], ...subscribers.map((s) => [s.email, s.createdAt])])}>Export CSV</button>}
            </div>
            {subscribers.length === 0 ? <p className="text-mist">Nobody has joined yet.</p> : (
              <ul className="divide-y divide-white/10 rounded-sm border border-white/10">
                {subscribers.map((s) => <li key={s.id} className="flex justify-between gap-3 px-4 py-2.5 text-sm"><span>{s.email}</span><span className="text-mist">{formatDate(s.createdAt)}</span></li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
