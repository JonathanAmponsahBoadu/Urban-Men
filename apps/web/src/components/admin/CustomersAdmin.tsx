"use client";

import { useState } from "react";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { demoteStaffToCustomer, grantUserStaffRole, logActivity, ordersStore, useCurrentUser, usersStore } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { ASSIGNABLE_ROLES, type StaffRole } from "@/lib/types";
import { btnOutline, input } from "@/lib/ui";

export function CustomersAdmin() {
  const me = useCurrentUser();
  const users = useStore(usersStore);
  const orders = useStore(ordersStore);
  const [q, setQ] = useState("");
  const who = me?.name ?? "Admin";

  const customers = users
    .map((u) => {
      const mine = orders.filter((o) => o.userId === u.id && o.status !== "Cancelled");
      return { u, count: mine.length, spent: mine.reduce((s, o) => s + (o.total ?? 0), 0) };
    });
  const needle = q.trim().toLowerCase();
  const shown = needle ? customers.filter(({ u }) => [u.name, u.email, u.phone ?? ""].join(" ").toLowerCase().includes(needle)) : customers;

  const onRoleChange = (userId: string, userName: string, newRole: string) => {
    if (newRole === "shopper") {
      demoteStaffToCustomer(userId);
      logActivity(who, `changed ${userName} to Shopper`);
      showToast(`${userName} is now a regular customer`);
    } else {
      grantUserStaffRole(userId, newRole as StaffRole);
      logActivity(who, `granted ${newRole} privilege to ${userName}`);
      showToast(`Granted ${newRole} privilege to ${userName}`);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Customers &amp; Accounts</h2>
        {customers.length > 0 && (
          <button type="button" className={btnOutline} onClick={() => downloadCsv("customers.csv", [["name", "email", "phone", "role", "orders", "spent", "joined"], ...customers.map(({ u, count, spent }) => [u.name, u.email, u.phone, u.staffRole ?? u.role, count, spent, u.createdAt])])}>
            Export CSV
          </button>
        )}
      </div>
      <p className="mt-2 text-mist">Anyone can create an account. Change any account&apos;s role below to grant staff privileges.</p>
      <label htmlFor="cust-q" className="sr-only">Search customers</label>
      <input id="cust-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or phone" className={`${input} mt-5 max-w-md`} />

      {shown.length === 0 ? (
        <p className="mt-8 text-mist">No accounts to show.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/15 text-xs uppercase tracking-[0.2em] text-mist">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Contact</th>
                <th className="py-2 font-medium">Privilege / Role</th>
                <th className="py-2 text-right font-medium">Orders</th>
                <th className="py-2 text-right font-medium">Spent</th>
                <th className="py-2 text-right font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ u, count, spent }) => (
                <tr key={u.id} className="border-b border-white/10">
                  <td className="py-3 font-semibold">{u.name}</td>
                  <td className="py-3 text-mist">{u.email}{u.phone ? ` · ${u.phone}` : ""}</td>
                  <td className="py-3">
                    {u.staffRole === "owner" ? (
                      <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">Owner</span>
                    ) : (
                      <select
                        aria-label={`Role for ${u.name}`}
                        value={u.staffRole ?? "shopper"}
                        onChange={(e) => onRoleChange(u.id, u.name, e.target.value)}
                        className={`${input} w-32 py-1 text-xs capitalize`}
                      >
                        <option value="shopper">Shopper</option>
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-3 text-right">{count}</td>
                  <td className="py-3 text-right text-gold">{formatPrice(spent)}</td>
                  <td className="py-3 text-right text-mist">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
