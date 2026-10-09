import { sizeChart } from "@/data/sizing";
import type { Size } from "@/lib/types";

export function SizeChart({ highlight }: { highlight?: Size }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <caption className="mb-3 text-left text-mist">Garment measurements in centimetres (allow ±2 cm).</caption>
        <thead>
          <tr className="border-b border-white/15 text-xs uppercase tracking-[0.2em] text-gold">
            <th className="py-3 pr-4 font-medium">Size</th>
            <th className="py-3 pr-4 font-medium">Chest</th>
            <th className="py-3 pr-4 font-medium">Shoulder</th>
            <th className="py-3 pr-4 font-medium">Sleeve</th>
            <th className="py-3 font-medium">Length</th>
          </tr>
        </thead>
        <tbody>
          {sizeChart.map((r) => (
            <tr key={r.size} className={`border-b border-white/10 ${highlight === r.size ? "bg-gold/10 text-gold" : ""}`}>
              <th scope="row" className="py-3 pr-4 font-semibold">{r.size}</th>
              <td className="py-3 pr-4">{r.chest}</td>
              <td className="py-3 pr-4">{r.shoulder}</td>
              <td className="py-3 pr-4">{r.sleeve}</td>
              <td className="py-3">{r.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
