// Places an order on the shop backend (Medusa) the way a guest checkout works:
// cart -> delivery details -> delivery option -> payment session -> complete.
import type { Product } from "@/data/products";
import { ApiError, storeApi } from "@/lib/api";
import type { Delivery, Size } from "@/lib/types";

const PAYSTACK = "pp_paystack_momo";

type Region = { id: string; currency_code: string; payment_providers?: { id: string }[] };

let regionCache: Promise<Region> | undefined;
function getRegion() {
  regionCache ??= storeApi<{ regions: Region[] }>("/store/regions?fields=id,currency_code,*payment_providers")
    .then((r) => r.regions.find((x) => x.currency_code === "ghs") ?? r.regions[0])
    .catch((e) => {
      regionCache = undefined;
      throw e;
    });
  return regionCache;
}

/** "momo" when Paystack is connected (real prompt on the phone), otherwise "manual" (we confirm payment by WhatsApp). */
export async function paymentMode(): Promise<"momo" | "manual"> {
  try {
    const region = await getRegion();
    return region.payment_providers?.some((p) => p.id === PAYSTACK) ? "momo" : "manual";
  } catch {
    return "manual";
  }
}

export type BackendOrderInput = {
  lines: { product: Product; size: Size; qty: number }[];
  delivery: Delivery;
  email: string;
  voucherCode?: string;
  /** Mobile Money details, used only when the backend has Paystack connected. */
  momo?: { network: string; phone: string };
  /** extra facts kept with the order (pre-order timing and so on) */
  metadata?: Record<string, unknown>;
};

export type BackendOrder = { id: string; displayId: number; total: number };

type ApiOrder = { id: string; display_id: number; total: number };
type CompleteResponse = { type: "order"; order: ApiOrder } | { type: "cart"; error?: { message?: string } };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function placeOnBackend(input: BackendOrderInput, onWaitingForPhone?: () => void): Promise<BackendOrder> {
  const region = await getRegion();
  const { delivery } = input;

  const items = input.lines.map((l) => {
    const variant_id = l.product.variantIds?.[l.size];
    if (!variant_id) throw new ApiError(`${l.product.name} (size ${l.size}) is not available right now.`, 400);
    return { variant_id, quantity: l.qty };
  });

  const [first, ...rest] = delivery.name.trim().split(/\s+/);
  // `auth`: a signed-in customer's order is attached to their account; a guest's is not
  const { cart } = await storeApi<{ cart: { id: string } }>("/store/carts", {
    method: "POST",
    auth: true,
    body: {
      region_id: region.id,
      email: input.email,
      items,
      ...(input.voucherCode ? { promo_codes: [input.voucherCode] } : {}),
      shipping_address: {
        first_name: first,
        last_name: rest.join(" ") || "-",
        address_1: delivery.address,
        city: delivery.region,
        province: delivery.region,
        postal_code: delivery.gps ?? "",
        country_code: "gh",
        phone: delivery.phone,
      },
      metadata: { delivery, ...input.metadata },
    },
  });

  const { shipping_options } = await storeApi<{ shipping_options: { id: string }[] }>(`/store/shipping-options?cart_id=${cart.id}`);
  if (!shipping_options.length) throw new ApiError("Delivery is not set up yet. Please order on WhatsApp instead.", 400);
  await storeApi(`/store/carts/${cart.id}/shipping-methods`, { method: "POST", body: { option_id: shipping_options[0].id } });

  const usePaystack = Boolean(input.momo) && region.payment_providers?.some((p) => p.id === PAYSTACK);
  const { payment_collection } = await storeApi<{ payment_collection: { id: string } }>("/store/payment-collections", {
    method: "POST",
    body: { cart_id: cart.id },
  });
  await storeApi(`/store/payment-collections/${payment_collection.id}/payment-sessions`, {
    method: "POST",
    body: usePaystack
      ? { provider_id: PAYSTACK, data: { phone: input.momo!.phone, network: input.momo!.network, email: input.email } }
      : { provider_id: region.payment_providers?.[0]?.id ?? "pp_system_default" },
  });

  // With Paystack the customer approves on their phone; the cart completes once Paystack confirms the payment.
  const attempts = usePaystack ? 40 : 1;
  if (usePaystack) onWaitingForPhone?.();
  for (let i = 0; i < attempts; i++) {
    const done = await storeApi<CompleteResponse>(`/store/carts/${cart.id}/complete`, { method: "POST", auth: true }).catch((e: unknown) => {
      if (usePaystack && e instanceof ApiError && e.status >= 500) return undefined;
      throw e;
    });
    if (done?.type === "order") return { id: done.order.id, displayId: done.order.display_id, total: done.order.total };
    if (!usePaystack) throw new ApiError(done?.type === "cart" && done.error?.message ? done.error.message : "We could not place your order.", 400);
    await sleep(3000);
  }
  throw new ApiError("We did not receive the payment approval in time. If money left your account, message us on WhatsApp and we will sort it out.", 408);
}
