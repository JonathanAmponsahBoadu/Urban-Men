"use client";

import Link from "next/link";
import { useStore } from "@/lib/storage";
import { vouchersStore } from "@/lib/stores";
import { card } from "@/lib/ui";

export function Vouchers() {
  const vouchers = useStore(vouchersStore).filter((v) => v.active);
  return (
    <div>
      <h2 className="font-display text-3xl">Vouchers</h2>
      {vouchers.length === 0 ? (
        <p className="mt-6 text-mist">No vouchers right now. When we run an offer, the code will appear here and you can enter it in your cart.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {vouchers.map((v) => (
            <li key={v.id} className={`${card} relative overflow-hidden p-5`}>
              <p className="font-display text-4xl text-gold">{v.percentOff}% off</p>
              <p className="mt-2 inline-block rounded-md border border-dashed border-gold/60 px-3 py-1 font-mono text-sm tracking-widest">{v.code}</p>
              {v.note && <p className="mt-3 text-sm text-mist">{v.note}</p>}
            </li>
          ))}
        </ul>
      )}
      {vouchers.length > 0 && (
        <p className="mt-6 text-sm text-mist">
          Enter a code in your <Link href="/cart" className="text-gold underline-offset-4 hover:underline">cart</Link> to use it.
        </p>
      )}
    </div>
  );
}
