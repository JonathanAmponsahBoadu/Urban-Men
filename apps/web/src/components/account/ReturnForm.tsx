"use client";

import { useState } from "react";
import { requestReturn } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { SIZES, type Order, type Size, type User } from "@/lib/types";
import { btnGhost, btnPrimary, input, label } from "@/lib/ui";

const reasons = ["It does not fit", "Not what I expected", "Faulty or damaged", "Wrong item received", "Other"];

export function ReturnForm({ order, user, onDone }: { order: Order; user: User; onDone: () => void }) {
  const [type, setType] = useState<"Return" | "Exchange">("Exchange");
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [wanted, setWanted] = useState<Size | "">("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "Exchange" && !wanted) return setError("Choose the size you would like instead.");
    requestReturn(user, { orderId: order.id, type, reason, details: details.trim() || undefined, wantedSize: type === "Exchange" && wanted ? wanted : undefined });
    showToast(`${type} request sent`);
    onDone();
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-md border border-white/15 bg-navy-deep p-4">
      <p className="font-semibold">Request a return or exchange for {order.id}</p>
      <fieldset className="flex gap-4">
        <legend className="sr-only">Type</legend>
        {(["Exchange", "Return"] as const).map((t) => (
          <label key={t} className="flex items-center gap-2 text-sm">
            <input type="radio" name={`type-${order.id}`} checked={type === t} onChange={() => setType(t)} className="accent-gold" /> {t}
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor={`reason-${order.id}`} className={label}>Reason</label>
        <select id={`reason-${order.id}`} value={reason} onChange={(e) => setReason(e.target.value)} className={input}>
          {reasons.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      {type === "Exchange" && (
        <div>
          <label htmlFor={`size-${order.id}`} className={label}>Size you would like instead</label>
          <select id={`size-${order.id}`} value={wanted} onChange={(e) => setWanted(e.target.value as Size)} className={input}>
            <option value="">Choose a size</option>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor={`det-${order.id}`} className={label}>Details (optional)</label>
        <textarea id={`det-${order.id}`} rows={3} value={details} onChange={(e) => setDetails(e.target.value)} className={input} />
      </div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className={btnPrimary}>Send request</button>
        <button type="button" onClick={onDone} className={btnGhost}>Cancel</button>
      </div>
    </form>
  );
}
