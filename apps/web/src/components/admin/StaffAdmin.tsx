"use client";

import { useState } from "react";
import { permissionLabels, roleDescriptions, rolePermissions, type Permission } from "@/lib/permissions";
import { useStore } from "@/lib/storage";
import { addStaff, logActivity, removeStaff, setStaffRole, staffStore, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { STAFF_ROLES, type StaffRole } from "@/lib/types";
import { btnPrimary, card, input, label } from "@/lib/ui";

const perms = Object.keys(permissionLabels) as Permission[];

export function StaffAdmin() {
  const me = useCurrentUser();
  const staff = useStore(staffStore);
  const [error, setError] = useState("");
  const [role, setRole] = useState<StaffRole>("manager");

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const r = await addStaff({ name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), password: String(f.get("password") ?? ""), role });
    if (!r.ok) return setError(r.error);
    logActivity(me?.name ?? "Owner", `added staff ${String(f.get("name"))} as ${role}`);
    setError("");
    form.reset();
    showToast("Staff account added");
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-display text-3xl">Staff &amp; roles</h2>
        <p className="mt-2 text-mist">Give people their own sign-in with only the access they need.</p>
      </div>

      <section aria-labelledby="matrix" className="overflow-x-auto">
        <h3 id="matrix" className="mb-3 font-display text-xl">What each role can open</h3>
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-b border-white/15 text-xs uppercase tracking-[0.2em] text-mist">
              <th className="py-2 font-medium">Area</th>
              {STAFF_ROLES.map((r) => <th key={r} className="py-2 text-center font-medium capitalize">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p} className="border-b border-white/10">
                <th scope="row" className="py-2 font-normal">{permissionLabels[p]}</th>
                {STAFF_ROLES.map((r) => (
                  <td key={r} className="py-2 text-center">{rolePermissions[r].includes(p) ? <span className="text-gold" aria-label="Allowed">✓</span> : <span className="text-white/25" aria-label="Not allowed">–</span>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-4 space-y-1 text-sm text-mist">
          {STAFF_ROLES.map((r) => <li key={r}><span className="font-semibold capitalize text-ivory">{r}:</span> {roleDescriptions[r]}</li>)}
        </ul>
      </section>

      <section aria-labelledby="team">
        <h3 id="team" className="mb-3 font-display text-xl">Team</h3>
        <ul className="space-y-3">
          <li className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
            <span>Store owner <span className="text-sm text-mist">(the main admin sign-in)</span></span>
            <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">owner</span>
          </li>
          {staff.map((s) => (
            <li key={s.id} className={`${card} flex flex-wrap items-center justify-between gap-3 p-4`}>
              <span>{s.name} <span className="text-sm text-mist">· {s.email}</span></span>
              <span className="flex items-center gap-3">
                <label className="sr-only" htmlFor={`role-${s.id}`}>Role for {s.name}</label>
                <select id={`role-${s.id}`} value={s.role} onChange={(e) => { setStaffRole(s.id, e.target.value as StaffRole); logActivity(me?.name ?? "Owner", `changed ${s.name} to ${e.target.value}`); }} className={`${input} w-36 py-1.5`}>
                  {STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <button type="button" onClick={() => { if (window.confirm(`Remove ${s.name}?`)) { removeStaff(s.id); logActivity(me?.name ?? "Owner", `removed staff ${s.name}`); } }} className="text-sm text-mist underline-offset-4 hover:text-red-300 hover:underline">Remove</button>
              </span>
            </li>
          ))}
          {staff.length === 0 && <li className="text-sm text-mist">No staff accounts yet.</li>}
        </ul>
      </section>

      <form onSubmit={add} className={`${card} grid gap-5 p-5 sm:grid-cols-2`}>
        <p className="font-display text-xl sm:col-span-2">Add a staff member</p>
        <div><label htmlFor="st-name" className={label}>Name</label><input id="st-name" name="name" required className={input} /></div>
        <div><label htmlFor="st-email" className={label}>Email</label><input id="st-email" name="email" type="email" required autoComplete="off" className={input} /></div>
        <div><label htmlFor="st-pass" className={label}>Password (8+ characters)</label><input id="st-pass" name="password" type="password" required minLength={8} autoComplete="new-password" className={input} /></div>
        <div>
          <label htmlFor="st-role" className={label}>Role</label>
          <select id="st-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className={input}>{STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}</select>
        </div>
        {error && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2"><button type="submit" className={btnPrimary}>Add staff member</button></div>
        <p className="text-xs text-mist sm:col-span-2">Preview mode: staff sign-ins live in this browser only. Real staff accounts come with the backend.</p>
      </form>
    </div>
  );
}
