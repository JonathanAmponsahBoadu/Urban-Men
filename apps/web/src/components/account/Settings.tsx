"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { backendOn } from "@/lib/api";
import { saveNotifyPrefsRemote } from "@/lib/account";
import { signOut, updateNotifyPrefs, updateProfile, useCurrentUser } from "@/lib/stores";
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
      <section aria-labelledby="notif" className="mt-6 rounded-sm border border-white/10 bg-navy-soft p-5">
        <h3 id="notif" className="font-display text-xl">Email updates</h3>
        <p className="mt-1 text-sm text-mist">Choose what we email to {user.email}. Updates also appear in your Inbox, and in the app as notifications.</p>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={user.notifyPrefs?.orderEmail ?? true} onChange={(e) => { updateNotifyPrefs(user.id, { orderEmail: e.target.checked }); void saveNotifyPrefsRemote({ orderEmail: e.target.checked }); }} className="mt-0.5 h-5 w-5 accent-gold" />
            <span>Order updates<span className="block text-mist">When your order is confirmed, made, on its way or delivered, and replies to your requests.</span></span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={user.notifyPrefs?.newsEmail ?? false} onChange={(e) => { updateNotifyPrefs(user.id, { newsEmail: e.target.checked }); void saveNotifyPrefsRemote({ newsEmail: e.target.checked }); }} className="mt-0.5 h-5 w-5 accent-gold" />
            <span>New designs and pre-orders<span className="block text-mist">Be first to know when a new design or a pre-order opens.</span></span>
          </label>
        </div>
        <p className="mt-3 text-xs text-mist">
          {backendOn ? "Your choices are saved to your account." : "Preview: your choices are saved now. Emails start going out when the shop's backend goes live."}
        </p>
      </section>
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
