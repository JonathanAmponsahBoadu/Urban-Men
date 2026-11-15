"use client";

import { useState } from "react";
import { deleteAddress, deleteMomoNumber, saveAddress, saveMomoNumber, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { GHANA_REGIONS, MOMO_NETWORKS, type MomoNetwork } from "@/lib/types";
import { btnGhost, btnOutline, btnPrimary, card, input, label } from "@/lib/ui";

const GH_PHONE = /^0\d{9}$/;
const GPS = /^[A-Z]{2,3}-\d{3,4}-\d{4}$/;
const clean = (v: string) => v.replace(/[\s-]/g, "");
const mask = (p: string) => `${p.slice(0, 3)} ••• ${p.slice(-3)}`;

export function Addresses() {
  const user = useCurrentUser();
  const [error, setError] = useState("");
  const [momoError, setMomoError] = useState("");
  const [network, setNetwork] = useState<MomoNetwork>("MTN MoMo");
  if (!user) return null;

  const addAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") ?? "").trim();
    const phone = clean(String(f.get("phone") ?? ""));
    const address = String(f.get("address") ?? "").trim();
    const gps = String(f.get("gps") ?? "").trim().toUpperCase();
    if (name.length < 2) return setError("Please enter a name.");
    if (!GH_PHONE.test(phone)) return setError("Enter a 10-digit phone number, like 024 000 0000.");
    if (address.length < 5) return setError("Please enter the full address.");
    if (gps && !GPS.test(gps)) return setError("Ghana Post GPS looks like GA-123-4567.");
    saveAddress(user.id, { label: String(f.get("label") ?? "").trim() || "Home", name, phone, region: String(f.get("region")), address, gps: gps || undefined });
    setError("");
    form.reset();
    showToast("Address saved");
  };

  const addMomo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const phone = clean(String(new FormData(form).get("momo") ?? ""));
    if (!GH_PHONE.test(phone)) return setMomoError("Enter a 10-digit Mobile Money number.");
    saveMomoNumber(user.id, { network, phone });
    setMomoError("");
    form.reset();
    showToast("Mobile Money number saved");
  };

  return (
    <div className="space-y-14">
      <section>
        <h2 className="font-display text-3xl">Addresses</h2>
        {(user.addresses ?? []).length === 0 ? (
          <p className="mt-4 text-mist">No saved addresses yet. Add one below and it will be ready at checkout.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {user.addresses!.map((a) => (
              <li key={a.id} className={`${card} p-5`}>
                <p className="font-semibold text-gold">{a.label}</p>
                <p className="mt-1">{a.name} · {a.phone}</p>
                <p className="text-mist">{a.address}, {a.region}{a.gps ? ` (${a.gps})` : ""}</p>
                <button type="button" onClick={() => deleteAddress(user.id, a.id)} className="mt-3 text-sm text-mist underline-offset-4 hover:text-red-300 hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addAddress} className={`${card} mt-6 grid gap-5 p-5 sm:grid-cols-2`}>
          <p className="font-display text-xl sm:col-span-2">Add an address</p>
          <div><label htmlFor="ad-label" className={label}>Label</label><input id="ad-label" name="label" placeholder="Home, Office…" className={input} /></div>
          <div><label htmlFor="ad-name" className={label}>Full name</label><input id="ad-name" name="name" defaultValue={user.name} className={input} /></div>
          <div><label htmlFor="ad-phone" className={label}>Phone</label><input id="ad-phone" name="phone" type="tel" defaultValue={user.phone} placeholder="024 000 0000" className={input} /></div>
          <div>
            <label htmlFor="ad-region" className={label}>Region</label>
            <select id="ad-region" name="region" defaultValue="Greater Accra" className={input}>{GHANA_REGIONS.map((r) => <option key={r}>{r}</option>)}</select>
          </div>
          <div className="sm:col-span-2"><label htmlFor="ad-address" className={label}>Address</label><textarea id="ad-address" name="address" rows={2} placeholder="Area, street, house number, landmark" className={input} /></div>
          <div><label htmlFor="ad-gps" className={label}>Ghana Post GPS (optional)</label><input id="ad-gps" name="gps" placeholder="GA-123-4567" className={`${input} uppercase`} /></div>
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2"><button type="submit" className={btnPrimary}>Save address</button></div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-3xl">Mobile Money numbers</h2>
        {(user.momoNumbers ?? []).length === 0 ? (
          <p className="mt-4 text-mist">No saved numbers yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {user.momoNumbers!.map((m) => (
              <li key={m.id} className={`${card} flex items-center justify-between gap-4 p-4`}>
                <span>{m.network} · {mask(m.phone)}</span>
                <button type="button" onClick={() => deleteMomoNumber(user.id, m.id)} className={btnGhost}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addMomo} className={`${card} mt-6 space-y-5 p-5`}>
          <p className="font-display text-xl">Add a number</p>
          <div className="flex flex-wrap gap-3">
            {MOMO_NETWORKS.map((n) => (
              <label key={n} className={`cursor-pointer rounded-full border px-5 py-2 text-sm ${network === n ? "border-gold bg-gold font-semibold text-navy" : "border-white/20 hover:border-gold"}`}>
                <input type="radio" name="net" checked={network === n} onChange={() => setNetwork(n)} className="sr-only" />
                {n}
              </label>
            ))}
          </div>
          <div className="max-w-xs"><label htmlFor="mm-num" className={label}>Number</label><input id="mm-num" name="momo" type="tel" placeholder="024 000 0000" className={input} /></div>
          {momoError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{momoError}</p>}
          <button type="submit" className={btnOutline}>Save number</button>
        </form>
      </section>
    </div>
  );
}
