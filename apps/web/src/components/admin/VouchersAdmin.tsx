"use client";

import { useState } from "react";
import { useStore } from "@/lib/storage";
import { deleteVoucher, logActivity, saveVoucher, useCurrentUser, vouchersStore } from "@/lib/stores";
import { btnGhost, btnPrimary, card, input, label } from "@/lib/ui";

export function VouchersAdmin() {
  const vouchers = useStore(vouchersStore);
  const me = useCurrentUser();
  const who = me?.name ?? "Admin";
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    const p = Number(percent);
    if (!/^[A-Z0-9-]{3,20}$/.test(c)) return setError("Code: 3 to 20 letters, numbers or dashes.");
    if (!(p > 0 && p <= 90)) return setError("Percent off must be between 1 and 90.");
    if (vouchers.some((v) => v.code === c)) return setError("That code already exists.");
    saveVoucher({ code: c, percentOff: Math.round(p), note: note.trim() || undefined, active: true });
    logActivity(who, `created voucher ${c} (${Math.round(p)}% off)`);
    setCode("");
    setNote("");
    setError("");
  };

  return (
    <div>
      <h2 className="font-display text-3xl">Vouchers</h2>
      <p className="mt-2 text-mist">Active vouchers show in customers&apos; accounts and can be entered in the cart.</p>

      <form onSubmit={add} className={`${card} mt-6 grid gap-4 p-5 sm:grid-cols-[1fr_8rem_2fr_auto] sm:items-end`}>
        <div>
          <label htmlFor="v-code" className={label}>Code</label>
          <input id="v-code" value={code} onChange={(e) => setCode(e.target.value)} className={`${input} uppercase`} placeholder="WELCOME10" />
        </div>
        <div>
          <label htmlFor="v-pct" className={label}>% off</label>
          <input id="v-pct" type="number" min={1} max={90} value={percent} onChange={(e) => setPercent(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="v-note" className={label}>Note (optional)</label>
          <input id="v-note" value={note} onChange={(e) => setNote(e.target.value)} className={input} placeholder="Welcome offer" />
        </div>
        <button type="submit" className={btnPrimary}>Add</button>
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300 sm:col-span-4">{error}</p>}
      </form>

      {vouchers.length === 0 ? (
        <p className="mt-8 text-mist">No vouchers yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {vouchers.map((v) => (
            <li key={v.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-4`}>
              <div>
                <p className="font-mono tracking-widest">{v.code} <span className="font-sans text-gold">· {v.percentOff}% off</span></p>
                {v.note && <p className="text-sm text-mist">{v.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => saveVoucher({ ...v, active: !v.active })} aria-pressed={v.active} className={`rounded-full px-4 py-2 text-sm font-semibold ${v.active ? "bg-emerald-400/15 text-emerald-700 dark:text-emerald-300" : "bg-white/10 text-mist"}`}>
                  {v.active ? "Active" : "Paused"}
                </button>
                <button type="button" onClick={() => { deleteVoucher(v.id); logActivity(who, `deleted voucher ${v.code}`); }} className={btnGhost}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
