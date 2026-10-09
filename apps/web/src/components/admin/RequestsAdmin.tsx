"use client";

import Image from "next/image";
import { useState } from "react";
import { RequestThread } from "@/components/RequestThread";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { logActivity, requestsStore, setRequestStatus, useCurrentUser, usersStore } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { REQUEST_STATUSES, type RequestStatus, type StyleRequest } from "@/lib/types";
import { btnPrimary, card, input } from "@/lib/ui";

function RequestCard({ r }: { r: StyleRequest }) {
  const users = useStore(usersStore);
  const me = useCurrentUser();
  const customer = users.find((u) => u.id === r.userId);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<RequestStatus>(r.status);

  return (
    <li className={`${card} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{r.id} · {r.userName}</p>
          <p className="text-sm text-mist">
            {formatDate(r.createdAt)} · {r.contact}
            {customer && ` · ${customer.email}`}
          </p>
        </div>
        <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">{r.status}</span>
      </div>
      <RequestThread request={r} viewer="admin" />
      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm text-mist sm:grid-cols-3">
        {r.colour && <div><dt className="inline text-xs uppercase tracking-[0.2em]">Colour </dt><dd className="inline text-ivory">{r.colour}</dd></div>}
        {r.budget && <div><dt className="inline text-xs uppercase tracking-[0.2em]">Budget </dt><dd className="inline text-ivory">{r.budget}</dd></div>}
        {r.measurements && <div className="sm:col-span-3"><dt className="inline text-xs uppercase tracking-[0.2em]">Measurements </dt><dd className="inline text-ivory">{r.measurements}</dd></div>}
      </dl>
      {r.images.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {r.images.map((src, i) => (
            <li key={i}>
              <a href={src} target="_blank" rel="noreferrer" className="relative block h-32 w-28 overflow-hidden rounded-sm bg-navy-deep">
                <Image src={src} alt={`Reference photo ${i + 1}`} fill sizes="112px" className="object-cover" unoptimized />
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-[14rem_1fr_auto] sm:items-end">
        <label className="text-xs uppercase tracking-[0.2em] text-mist">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as RequestStatus)} className={`${input} mt-1`}>
            {REQUEST_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-mist">
          Reply to customer (price, what is possible…)
          <input value={note} onChange={(e) => setNote(e.target.value)} className={`${input} mt-1`} placeholder="We can do this in navy for GH₵ 750…" />
        </label>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => { setRequestStatus(r.id, status, note); logActivity(me?.name ?? "Admin", `replied to style request ${r.id} (${status})`); setNote(""); showToast("Reply sent to the customer's inbox"); }}
        >
          Send
        </button>
      </div>
    </li>
  );
}

export function RequestsAdmin() {
  const requests = useStore(requestsStore);
  return (
    <div>
      <h2 className="font-display text-3xl">Style requests</h2>
      <p className="mt-2 text-mist">Custom styles customers have asked for, with their photos. Your reply lands in their inbox.</p>
      {requests.length === 0 ? (
        <p className="mt-8 text-mist">No requests yet.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {requests.map((r) => <RequestCard key={`${r.id}-${r.status}-${r.thread?.length ?? 0}`} r={r} />)}
        </ul>
      )}
    </div>
  );
}
