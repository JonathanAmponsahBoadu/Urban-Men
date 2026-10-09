"use client";

import { useState } from "react";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { ordersStore, usersStore } from "@/lib/stores";
import { btnOutline, input } from "@/lib/ui";

export function CustomersAdmin() {
  const users = useStore(usersStore);
  const orders = useStore(ordersStore);
  const [q, setQ] = useState("");

  const customers = users
    .filter((u) => u.role === "shopper")
    .map((u) => {
      const mine = orders.filter((o) => o.userId === u.id && o.status !== "Cancelled");
      return { u, count: mine.length, spent: mine.reduce((s, o) => s + (o.total ?? 0), 0) };
    });
  const needle = q.trim().toLowerCase();
  const shown = needle ? customers.filter(({ u }) => [u.name, u.email, u.phone ?? ""].join(" ").toLowerCase().includes(needle)) : customers;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Customers</h2>
        {customers.length > 0 && (
          <button type="button" className={btnOutline} onClick={() => downloadCsv("customers.csv", [["name", "email", "phone", "orders", "spent", "joined"], ...customers.map(({ u, count, spent }) => [u.name, u.email, u.phone, count, spent, u.createdAt])])}>
            Export CSV
          </button>
        )}
      </div>
      <p className="mt-2 text-mist">{customers.length} customer{customers.length === 1 ? "" : "s"} with an account.</p>
      <label htmlFor="cust-q" className="sr-only">Search customers</label>
      <input id="cust-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or phone" className={`${input} mt-5 max-w-md`} />

      {shown.length === 0 ? (
        <p className="mt-8 text-mist">No customers to show.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead>
              <tr className="border-b border-white/15 text-xs uppercase tracking-[0.2em] text-mist">
                <th className="py-2 font-medium">Name</th><th className="py-2 font-medium">Contact</th><th className="py-2 text-right font-medium">Orders</th><th className="py-2 text-right font-medium">Spent</th><th className="py-2 text-right font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ u, count, spent }) => (
                <tr key={u.id} className="border-b border-white/10">
                  <td className="py-3 font-semibold">{u.name}</td>
                  <td className="py-3 text-mist">{u.email}{u.phone ? ` · ${u.phone}` : ""}</td>
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
