import type { Order } from "@/lib/types";

const mask = (p: string) => `${p.slice(0, 3)} ••• ${p.slice(-3)}`;

/** Payment + delivery summary shown under an order (shopper and admin). */
export function OrderExtras({ order, showContact = false }: { order: Order; showContact?: boolean }) {
  const { payment, delivery } = order;
  if (!payment && !delivery) return null;
  return (
    <dl className="grid gap-4 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
      {payment && (
        <div>
          <dt className="text-xs uppercase tracking-[0.25em] text-mist">Payment</dt>
          <dd className="mt-1">
            {payment.method === "momo" ? (
              <>
                {payment.network} · {payment.phone ? mask(payment.phone) : ""}
                {payment.demo && <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">Demo, not charged</span>}
              </>
            ) : (
              "To be arranged on WhatsApp"
            )}
          </dd>
        </div>
      )}
      {delivery && (
        <div>
          <dt className="text-xs uppercase tracking-[0.25em] text-mist">Delivery</dt>
          <dd className="mt-1">
            {showContact && <span className="block">{delivery.name} · {delivery.phone}</span>}
            <span className="block">{delivery.address}</span>
            {delivery.notes && <span className="block text-mist">Note: {delivery.notes}</span>}
            {delivery.trouserNote && <span className="block text-mist">Trouser size: {delivery.trouserNote}</span>}
            <span className="mt-1 block text-xs text-mist">
              Cost and arrival time are confirmed with you. Updates by {[delivery.updatesByEmail && "email", delivery.updatesBySms && "SMS"].filter(Boolean).join(" and ") || "WhatsApp only"}.
            </span>
          </dd>
        </div>
      )}
    </dl>
  );
}
