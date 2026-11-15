"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

export type Point = { label: string; value: number; detail?: string };

/** Round up to a clean axis maximum: 1, 2, 5 × 10^n. */
function niceMax(v: number) {
  if (v <= 0) return 100;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const W = 640;
const H = 240;
const M = { l: 52, r: 8, t: 14, b: 30 };

/**
 * Single-series column chart: thin columns, 4px rounded tops on a flat baseline, hairline
 * gridlines, the largest value labelled, a tooltip on hover/focus, and a table view.
 */
export function ColumnChart({ title, points, money = false, unit = "" }: { title: string; points: Point[]; money?: boolean; unit?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const plotW = W - M.l - M.r;
  const plotH = H - M.t - M.b;
  const band = plotW / points.length;
  const barW = Math.min(24, band * 0.6);
  const y = (v: number) => M.t + plotH - (v / max) * plotH;
  const fmt = (v: number) => (money ? (formatPrice(v) ?? "") : `${v.toLocaleString("en-GH")}${unit}`);
  const fmtTick = (v: number) => (money ? v.toLocaleString("en-GH") : v.toLocaleString("en-GH"));
  const best = points.reduce((b, p, i) => (p.value > points[b].value ? i : b), 0);
  const total = points.reduce((s, p) => s + p.value, 0);

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. Total ${fmt(total)}.`} className="w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} className="stroke-white/10" strokeWidth={1} />
            <text x={M.l - 8} y={y(t) + 4} textAnchor="end" className="fill-mist text-[11px]">{fmtTick(t)}</text>
          </g>
        ))}
        {points.map((p, i) => {
          const cx = M.l + band * i + band / 2;
          const h = Math.max(p.value > 0 ? 2 : 0, (p.value / max) * plotH);
          const top = M.t + plotH - h;
          const r = Math.min(4, barW / 2, h);
          const d = `M${cx - barW / 2},${M.t + plotH} V${top + r} Q${cx - barW / 2},${top} ${cx - barW / 2 + r},${top} H${cx + barW / 2 - r} Q${cx + barW / 2},${top} ${cx + barW / 2},${top + r} V${M.t + plotH} Z`;
          return (
            <g key={i}>
              {p.value > 0 && <path d={d} className={active === i ? "fill-gold-deep" : "fill-gold"} />}
              {i % 2 === 0 || points.length <= 8 ? <text x={cx} y={H - 10} textAnchor="middle" className="fill-mist text-[11px]">{p.label}</text> : null}
              {i === best && p.value > 0 && (
                <text
                  x={cx > W - M.r - 56 ? W - M.r : cx < M.l + 56 ? M.l : cx}
                  y={top - 6}
                  textAnchor={cx > W - M.r - 56 ? "end" : cx < M.l + 56 ? "start" : "middle"}
                  className="fill-ivory text-[11px] font-semibold"
                >
                  {fmt(p.value)}
                </text>
              )}
              <rect
                x={M.l + band * i}
                y={M.t}
                width={band}
                height={plotH + M.b}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${p.label}: ${fmt(p.value)}${p.detail ? `, ${p.detail}` : ""}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              />
            </g>
          );
        })}
        <line x1={M.l} x2={W - M.r} y1={M.t + plotH} y2={M.t + plotH} className="stroke-white/25" strokeWidth={1} />
      </svg>

      {active !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-md border border-white/15 bg-navy-deep px-3 py-2 text-sm shadow-xl"
          style={{ left: `${((M.l + band * active + band / 2) / W) * 100}%`, top: 0 }}
          role="status"
        >
          <p className="font-semibold text-ivory">{fmt(points[active].value)}</p>
          <p className="text-xs text-mist">{points[active].label}{points[active].detail ? ` · ${points[active].detail}` : ""}</p>
        </div>
      )}

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-mist hover:text-gold">View as table</summary>
        <table className="mt-3 w-full text-left">
          <thead><tr className="border-b border-white/15 text-xs uppercase tracking-[0.2em] text-mist"><th className="py-2 font-medium">Day</th><th className="py-2 text-right font-medium">{money ? "Order value" : "Count"}</th><th className="py-2 text-right font-medium">Detail</th></tr></thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i} className="border-b border-white/10"><td className="py-1.5">{p.label}</td><td className="py-1.5 text-right">{fmt(p.value)}</td><td className="py-1.5 text-right text-mist">{p.detail ?? ""}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Horizontal bars for a few labelled categories: value at the bar tip, one hue. */
export function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <ul className="space-y-3" aria-label="Orders by status">
      {rows.map((r) => (
        <li key={r.label} tabIndex={0} className="group grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 text-sm outline-none" title={`${r.label}: ${r.value}${total ? ` (${Math.round((r.value / total) * 100)}%)` : ""}`}>
          <span className="text-mist">{r.label}</span>
          <span className="h-3 rounded-r-[4px] bg-white/5">
            <span className="block h-full rounded-r-[4px] bg-gold transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value > 0 ? 4 : 0 }} />
          </span>
          <span className="text-right font-semibold">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
