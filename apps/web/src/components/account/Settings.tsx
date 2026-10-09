"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, updateProfile, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { btnGhost, btnPrimary, input, label } from "@/lib/ui";

export function Settings() {
  const router = useRouter();
  const user = useCurrentUser();
  const [name, setName] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(user.id, {
      name: (name ?? user.name).trim() || user.name,
      phone: (phone ?? user.phone ?? "").trim() || undefined,
      address: (address ?? user.address ?? "").trim() || undefined,
    });
    showToast("Settings saved");
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl">Settings</h2>
      <form onSubmit={save} className="mt-6 space-y-5">
        <div>
          <label htmlFor="s-name" className={label}>Full name</label>
          <input id="s-name" value={name ?? user.name} onChange={(e) => setName(e.target.value)} className={input} required />
        </div>
        <div>
          <label htmlFor="s-email" className={label}>Email</label>
          <input id="s-email" value={user.email} readOnly className={`${input} opacity-60`} />
        </div>
        <div>
          <label htmlFor="s-phone" className={label}>Phone</label>
          <input id="s-phone" type="tel" value={phone ?? user.phone ?? ""} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="055 000 0000" />
        </div>
        <div>
          <label htmlFor="s-address" className={label}>Delivery address</label>
          <textarea id="s-address" rows={3} value={address ?? user.address ?? ""} onChange={(e) => setAddress(e.target.value)} className={input} placeholder="Area, street, landmark" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary}>Save changes</button>
          <button
            type="button"
            className={btnGhost}
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
