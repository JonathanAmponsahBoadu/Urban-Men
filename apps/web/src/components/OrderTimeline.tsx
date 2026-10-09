import type { OrderStatus } from "@/lib/types";

const steps: { status: OrderStatus; label: string }[] = [
  { status: "Awaiting confirmation", label: "Order placed" },
  { status: "Confirmed", label: "Confirmed" },
  { status: "In production", label: "In production" },
  { status: "Out for delivery", label: "Out for delivery" },
  { status: "Delivered", label: "Delivered" },
];

/** Visual progress for an order. */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") {
    return <p className="rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-200">This order was cancelled.</p>;
  }
  const current = steps.findIndex((s) => s.status === status);
  return (
    <ol aria-label="Order progress" className="grid grid-cols-5 gap-1">
      {steps.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s.status} aria-current={i === current ? "step" : undefined} className="relative flex flex-col items-center text-center">
            {i > 0 && <span aria-hidden className={`absolute right-1/2 top-3.5 h-0.5 w-full ${i <= current ? "bg-gold" : "bg-white/15"}`} />}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                done ? "border-gold bg-gold text-navy" : "border-white/25 bg-navy-deep text-mist"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={`mt-2 text-[0.7rem] leading-tight sm:text-xs ${done ? "text-ivory" : "text-mist"}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
