"use client";

import Link from "next/link";
import { useState } from "react";
import { recommendSize } from "@/data/sizing";
import { saveMeasurements, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import type { Measurements as M } from "@/lib/types";
import { btnPrimary, input, label } from "@/lib/ui";

const fields: { key: keyof M; label: string; hint: string }[] = [
  { key: "chest", label: "Chest", hint: "around the fullest part" },
  { key: "shoulder", label: "Shoulder", hint: "edge to edge across the back" },
  { key: "sleeve", label: "Sleeve", hint: "shoulder edge to wrist" },
  { key: "length", label: "Shirt length", hint: "collar base to hem" },
  { key: "waist", label: "Waist", hint: "for trousers" },
];

export function Measurements() {
  const user = useCurrentUser();
  const [draft, setDraft] = useState<Partial<Record<keyof M, string>>>({});
  if (!user) return null;

  const value = (k: keyof M) => draft[k] ?? (user.measurements?.[k] !== undefined ? String(user.measurements[k]) : "");
  const chest = Number(value("chest")) || undefined;
  const suggestion = recommendSize(chest);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: M = {};
    for (const f of fields) {
      const n = Number(value(f.key));
      if (n > 0) next[f.key] = Math.round(n * 10) / 10;
    }
    saveMeasurements(user.id, next);
    setDraft({});
    showToast("Measurements saved");
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl">My measurements</h2>
      <p className="mt-2 text-mist">Save your measurements in centimetres. We use them to suggest a size on every shirt, and you can quote them in a custom style request.</p>
      <form onSubmit={save} className="mt-6 grid gap-5 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`m-${f.key}`} className={label}>{f.label} (cm)</label>
            <input id={`m-${f.key}`} type="number" min={0} step="0.5" value={value(f.key)} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className={input} />
            <p className="mt-1 text-xs text-mist">{f.hint}</p>
          </div>
        ))}
        <div className="sm:col-span-2">
          {suggestion && <p className="mb-4 rounded-md bg-gold/10 px-4 py-3 text-gold">Suggested shirt size: <span className="font-semibold">{suggestion}</span></p>}
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className={btnPrimary}>Save measurements</button>
            <Link href="/size-guide" className="text-sm text-gold underline-offset-4 hover:underline">How to measure</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
