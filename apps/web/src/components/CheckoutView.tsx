"use client";

// FRONTEND-ONLY checkout. Nothing here moves money, calculates delivery or sends messages yet.
//
// TODO(backend), to build later:
//  1. MoMo payment: connect a real provider (e.g. Paystack mobile money) so the "approve on your phone"
//     step is a real payment prompt, with the payment confirmed server-side before an order is "paid".
//  2. Map: a "Pin my location" button opening Google Maps; the customer picks their current location.
//  3. Delivery fee: price the trip from the picked location with Yango / Uber / Bolt rates, add it to
//     the order amount, and let the customer pay the total here.
//  4. Delivery time: show the estimated delivery time after payment.
//  5. Updates: keep the customer posted by email and SMS (the opt-in boxes below are already saved on the order).
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAllProducts } from "@/components/CatalogueProvider";
import { whatsappUrl } from "@/data/site";
import { backendOn, warmBackend } from "@/lib/api";
import { paymentMode, placeOnBackend } from "@/lib/checkout";
import { displayName, formatPrice, fullName, isPreorder } from "@/lib/format";
import { paymentSplit } from "@/lib/preorder";
import { useSiteSettings } from "@/lib/settings";
import { useHydrated, useStore } from "@/lib/storage";
import { cartStore, findVoucher, placeOrder, saveAddress, saveMomoNumber, useCurrentUser } from "@/lib/stores";
import { showToast } from "@/lib/toast";
import { GHANA_REGIONS, MOMO_NETWORKS, type MomoNetwork, type OrderLine, type User } from "@/lib/types";
import { btnGhost, btnOutline, btnPrimary, input, label } from "@/lib/ui";

const GH_PHONE = /^0\d{9}$/;
const GPS = /^[A-Z]{2,3}-\d{3,4}-\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: string) => v.replace(/[\s-]/g, "");
const mask = (p: string) => `${p.slice(0, 3)} ••• ${p.slice(-3)}`;

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-white/10 bg-navy-soft p-6">
      <h2 className="flex items-center gap-3 font-display text-2xl">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-sans text-sm font-bold text-navy">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ComingSoon({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-gold/40 bg-gold/5 p-4 text-sm text-mist">
      <span className="mr-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-gold">Coming soon</span>
      {children}
    </p>
  );
}

function Checkout({ account }: { account: User | null }) {
  const router = useRouter();
  const cart = useStore(cartStore);
  const products = useAllProducts();
  const { preorderDepositPercent } = useSiteSettings();
  const voucher = findVoucher(useSearchParams().get("voucher") ?? "");
  const first = account?.addresses?.[0];

  const [name, setName] = useState(first?.name ?? account?.name ?? "");
  const [phone, setPhone] = useState(first?.phone ?? account?.phone ?? "");
  const [email, setEmail] = useState(account?.email ?? "");
  const [region, setRegion] = useState<string>(first?.region ?? "Greater Accra");
  const [address, setAddress] = useState(first?.address ?? account?.address ?? "");
  const [gps, setGps] = useState(first?.gps ?? "");
  const [notes, setNotes] = useState("");

  const [saveAddr, setSaveAddr] = useState(Boolean(account && !account.addresses?.length));
  const [byEmail, setByEmail] = useState(true);
  const [bySms, setBySms] = useState(true);
  const [network, setNetwork] = useState<MomoNetwork>(account?.momoNumbers?.[0]?.network ?? "MTN MoMo");
  const [momoPhone, setMomoPhone] = useState(account?.momoNumbers?.[0]?.phone ?? account?.phone ?? "");
  const [saveMomo, setSaveMomo] = useState(Boolean(account && !account.momoNumbers?.length));
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);
  // "demo": no backend, nothing is saved on a server. "momo": real Paystack prompt. "manual": order saved on the
  // server and payment is confirmed with the customer on WhatsApp.
  const [mode, setMode] = useState<"demo" | "momo" | "manual">(backendOn ? "manual" : "demo");
  const [placing, setPlacing] = useState(false);
  const [waitingForPhone, setWaitingForPhone] = useState(false);
  useEffect(() => {
    warmBackend();
    if (backendOn) paymentMode().then(setMode);
  }, []);

  const lines = cart
    .map((item) => ({ item, product: products.find((p) => p.slug === item.slug) }))
    .filter((l): l is { item: typeof l.item; product: NonNullable<typeof l.product> } => Boolean(l.product));

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <p className="mt-3 text-mist">Your cart is empty.</p>
        <Link href="/shop" className={`${btnPrimary} mt-8`}>Browse the collection</Link>
      </div>
    );
  }

  const allPriced = lines.every((l) => l.product.price !== undefined);
  const subtotal = allPriced ? lines.reduce((s, l) => s + l.product.price! * l.item.qty, 0) : undefined;
  const discount = subtotal !== undefined && voucher ? Math.round(subtotal * voucher.percentOff) / 100 : 0;
  const total = subtotal !== undefined ? Math.round((subtotal - discount) * 100) / 100 : undefined;
  const count = lines.reduce((n, l) => n + l.item.qty, 0);

  const orderLines: OrderLine[] = lines.map(({ item, product }) => ({
    slug: item.slug,
    name: fullName(product),
    size: item.size,
    qty: item.qty,
    price: product.price,
    image: product.images[0].src,
    ...(isPreorder(product) ? { preorder: true } : {}),
  }));
  // The deposit model for pre-orders is not built on the server yet: with the backend connected, pay in full.
  const split = subtotal !== undefined ? paymentSplit(orderLines, backendOn ? 100 : preorderDepositPercent, discount) : undefined;
  const dueNow = split?.dueNow ?? total;
  const readyBy = [...new Set(lines.flatMap((l) => (isPreorder(l.product) && l.product.preorder?.readyBy ? [l.product.preorder.readyBy] : [])))].join(" / ") || undefined;

  const delivery = () => ({
    name: name.trim(),
    phone: clean(phone),
    email: email.trim() || undefined,
    region,
    gps: gps.trim() ? gps.trim().toUpperCase() : undefined,
    address: address.trim(),
    notes: notes.trim() || undefined,
    updatesByEmail: byEmail,
    updatesBySms: bySms,
  });

  const validateDelivery = () => {
    if (name.trim().length < 2) return "Please enter your name.";
    if (!GH_PHONE.test(clean(phone))) return "Enter a 10-digit phone number, like 024 000 0000.";
    if (!account && !EMAIL.test(email.trim())) return "Enter your email so we can send your order details.";
    if (address.trim().length < 5) return "Please enter your delivery address.";
    if (gps.trim() && !GPS.test(gps.trim().toUpperCase())) return "Ghana Post GPS looks like GA-123-4567.";
    return "";
  };

  const startPayment = () => {
    if (mode === "manual") return whatsappInstead();
    const problem = validateDelivery() || (!GH_PHONE.test(clean(momoPhone)) ? "Enter the 10-digit Mobile Money number to pay from." : "");
    if (problem) return setError(problem);
    setError("");
    if (mode === "momo") void finish("momo"); // a real prompt goes to the customer's phone
    else setApproving(true); // demo: simulate the approval
  };

  const preorderInfo = split?.hasPreorder ? (backendOn ? { readyBy } : { paidNow: split.dueNow, balance: split.balance, readyBy }) : {};

  const finish = async (method: "momo" | "whatsapp") => {
    const buyer: User = account ?? { id: "guest", name: name.trim() || "Guest", email: email.trim(), phone: clean(phone), role: "shopper", createdAt: new Date().toISOString() };
    // the real Mobile Money prompt only exists when Paystack is connected on the backend
    const payByMomo = method === "momo" && mode !== "manual";

    let remote: { id: string; displayId: number; total: number } | undefined;
    if (backendOn) {
      setError("");
      setPlacing(true);
      try {
        const placed = await placeOnBackend(
          {
            lines: lines.map(({ item, product }) => ({ product, size: item.size, qty: item.qty })),
            delivery: delivery(),
            email: buyer.email,
            voucherCode: voucher?.code,
            momo: payByMomo ? { network, phone: clean(momoPhone) } : undefined,
            metadata: {
              payment_method: payByMomo ? "momo" : "whatsapp",
              preorder: Boolean(split?.hasPreorder),
              ready_by: readyBy ?? null,
            },
          },
          () => setWaitingForPhone(true),
        );
        remote = placed;
      } catch (e) {
        setPlacing(false);
        setWaitingForPhone(false);
        setApproving(false);
        setError(e instanceof Error ? e.message : "We could not place your order. Please try again.");
        return;
      }
      setPlacing(false);
      setWaitingForPhone(false);
    }

    const payment = payByMomo
      ? { method: "momo" as const, network, phone: clean(momoPhone), ...(backendOn ? {} : { demo: true }) }
      : { method: "whatsapp" as const };
    const order = placeOrder(buyer, orderLines, products, voucher, { payment, delivery: delivery(), ...preorderInfo, remote });
    if (account) {
      if (saveAddr) saveAddress(account.id, { label: region, name: name.trim(), phone: clean(phone), region, address: address.trim(), gps: gps.trim() ? gps.trim().toUpperCase() : undefined });
      if (payByMomo && saveMomo) saveMomoNumber(account.id, { network, phone: clean(momoPhone) });
    }
    cartStore.set([]);
    setApproving(false);
    showToast(`Order ${order.id} placed`);
    // (with the backend connected the confirmation page has the "Ask on WhatsApp" button; a popup after a
    //  network call would be blocked by the browser)
    if (method === "whatsapp" && !backendOn) {
      const text = [
        `Hello Urban Men, I have placed order ${order.id}:`,
        ...orderLines.map((l) => `• ${l.qty} × ${l.name} (size ${l.size})${l.price !== undefined ? ` – ${formatPrice(l.price)}` : ""}`),
        order.total !== undefined ? `Total: ${formatPrice(order.total)}` : "Please confirm the price.",
        order.balance ? `Pre-order: ${formatPrice(order.paidNow)} now, balance ${formatPrice(order.balance)} before delivery.` : "",
        `Deliver to: ${address.trim()}, ${region}${gps.trim() ? ` (${gps.trim().toUpperCase()})` : ""}`,
        `Phone: ${clean(phone)}`,
        ].filter(Boolean).join("\n");
      window.open(whatsappUrl(text), "_blank", "noopener");
    }
    router.push(`/order/${order.id}`);
  };

  const whatsappInstead = () => {
    const problem = validateDelivery();
    if (problem) return setError(problem);
    setError("");
    finish("whatsapp");
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:px-10 md:pt-14">
      <Link href="/cart" className="text-sm text-mist hover:text-gold">← Back to cart</Link>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Checkout</h1>
      {!account && (
        <p className="mt-4 rounded-md border border-white/15 bg-navy-soft px-4 py-3 text-sm text-mist">
          Checking out as a guest. Already have an account? <Link href="/login?next=/checkout" className="text-gold underline-offset-4 hover:underline">Sign in</Link> to use your saved details.
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Step n={1} title="Delivery details">
            {account?.addresses && account.addresses.length > 0 && (
              <div className="mb-5">
                <label htmlFor="c-saved" className={label}>Use a saved address</label>
                <select
                  id="c-saved"
                  defaultValue={account.addresses[0].id}
                  onChange={(e) => {
                    const a = account.addresses?.find((x) => x.id === e.target.value);
                    if (!a) return;
                    setName(a.name); setPhone(a.phone); setRegion(a.region); setAddress(a.address); setGps(a.gps ?? "");
                  }}
                  className={input}
                >
                  {account.addresses.map((a) => <option key={a.id} value={a.id}>{a.label}: {a.address}</option>)}
                </select>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-name" className={label}>Full name</label>
                <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
              </div>
              <div>
                <label htmlFor="c-phone" className={label}>Phone number</label>
                <input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="024 000 0000" className={input} />
              </div>
              {!account && (
                <div className="sm:col-span-2">
                  <label htmlFor="c-email" className={label}>Email</label>
                  <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
                </div>
              )}
              <div>
                <label htmlFor="c-region" className={label}>Region</label>
                <select id="c-region" value={region} onChange={(e) => setRegion(e.target.value)} className={input}>
                  {GHANA_REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-gps" className={label}>Ghana Post GPS (optional)</label>
                <input id="c-gps" value={gps} onChange={(e) => setGps(e.target.value)} placeholder="GA-123-4567" className={`${input} uppercase`} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-address" className={label}>Delivery address</label>
                <textarea id="c-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} className={input} placeholder="Area, street, house number, landmark" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-notes" className={label}>Delivery notes (optional)</label>
                <input id="c-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={input} placeholder="Gate colour, call on arrival…" />
              </div>
            </div>
            {account && (
              <label className="mt-4 flex items-center gap-3 text-sm">
                <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} className="h-5 w-5 accent-gold" /> Save this address to my account
              </label>
            )}
            <div className="mt-5 space-y-3">
              <button type="button" disabled className={`${btnOutline} w-full sm:w-auto`}>📍 Pin my location on the map</button>
              <ComingSoon>Pick your current location on Google Maps so we can work out your delivery cost and time. For now, type your address above.</ComingSoon>
            </div>
          </Step>

          <Step n={2} title="Delivery cost & time">
            <ComingSoon>
              Your delivery cost will be worked out from your location using ride-hailing rates (Yango, Uber, Bolt) and added to your total, with the delivery time shown after you pay.
            </ComingSoon>
            <p className="mt-4 text-sm text-mist">Until then, we confirm the delivery cost and time with you after your order.</p>
            <fieldset className="mt-5 space-y-3">
              <legend className="mb-1 text-xs uppercase tracking-[0.25em] text-mist">Keep me posted by</legend>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={byEmail} onChange={(e) => setByEmail(e.target.checked)} className="h-5 w-5 accent-gold" /> Email{email ? ` (${email})` : ""}
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={bySms} onChange={(e) => setBySms(e.target.checked)} className="h-5 w-5 accent-gold" /> SMS (to your phone number)
              </label>
              <p className="text-xs text-mist">
                {backendOn ? "Your choice is saved with the order." : "Your choice is saved with the order. Sending begins when notifications are connected."}
              </p>
            </fieldset>
          </Step>

          <Step n={3} title="Payment">
            {mode === "manual" ? (
              <div className="rounded-md border border-gold/60 bg-gold/5 p-4">
                <p className="font-semibold">Pay by Mobile Money after we confirm</p>
                <p className="mt-1 text-sm text-mist">
                  Place your order and we will message you on WhatsApp or call to confirm your sizes and delivery, then send our Mobile Money details. Your pieces are reserved for you.
                </p>
              </div>
            ) : (
            <div className="rounded-md border border-gold/60 bg-gold/5 p-4">
              <p className="font-semibold">Mobile Money</p>
              <p className="text-sm text-mist">Pay straight from your phone.</p>
              {account?.momoNumbers && account.momoNumbers.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {account.momoNumbers.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setNetwork(m.network); setMomoPhone(m.phone); }} className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:border-gold">
                      {m.network} · {mask(m.phone)}
                    </button>
                  ))}
                </div>
              )}
              <fieldset className="mt-4">
                <legend className="mb-2 text-xs uppercase tracking-[0.25em] text-mist">Network</legend>
                <div className="flex flex-wrap gap-3">
                  {MOMO_NETWORKS.map((n) => (
                    <label key={n} className={`cursor-pointer rounded-full border px-5 py-2 text-sm transition-colors ${network === n ? "border-gold bg-gold font-semibold text-navy" : "border-white/20 hover:border-gold"}`}>
                      <input type="radio" name="network" value={n} checked={network === n} onChange={() => setNetwork(n)} className="sr-only" />
                      {n}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-4 max-w-xs">
                <label htmlFor="c-momo" className={label}>Mobile Money number</label>
                <input id="c-momo" type="tel" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} placeholder="024 000 0000" className={input} />
              </div>
              {account && (
                <label className="mt-4 flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={saveMomo} onChange={(e) => setSaveMomo(e.target.checked)} className="h-5 w-5 accent-gold" /> Save this number for next time
                </label>
              )}
            </div>
            )}
            {mode === "demo" && (
              <p className="mt-4 rounded-md bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">Demo mode:</span> real MoMo payments are not connected yet. Nothing is charged, and your order is saved for testing only.
              </p>
            )}
          </Step>
        </div>

        <aside className="h-fit rounded-sm border border-white/10 bg-navy-soft p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-5 divide-y divide-white/10">
            {lines.map(({ item, product }) => (
              <li key={`${item.slug}-${item.size}`} className="flex items-center gap-3 py-3 text-sm">
                <div className="relative aspect-4/5 w-12 shrink-0 overflow-hidden rounded-sm bg-navy-deep">
                  <Image src={product.images[0].src} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="leading-tight">{displayName(product)}</p>
                  <p className="text-xs text-mist">Size {item.size} · Qty {item.qty}{isPreorder(product) ? " · Pre-order" : ""}</p>
                </div>
                {product.price !== undefined && <p className="text-gold">{formatPrice(product.price * item.qty)}</p>}
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-mist">Items</dt><dd>{count}</dd></div>
            <div className="flex justify-between"><dt className="text-mist">Subtotal</dt><dd>{subtotal !== undefined ? formatPrice(subtotal) : "To confirm"}</dd></div>
            {discount > 0 && <div className="flex justify-between text-emerald-700 dark:text-emerald-300"><dt>Voucher {voucher?.code}</dt><dd>− {formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-mist">Delivery</dt><dd className="text-mist">To be confirmed</dd></div>
            {split?.hasPreorder && split.balance > 0 ? (
              <>
                <div className="flex justify-between border-t border-white/10 pt-4"><dt className="text-mist">Order total</dt><dd>{formatPrice(split.total)}</dd></div>
                <div className="flex justify-between text-lg font-semibold"><dt>Pay now</dt><dd className="text-gold">{formatPrice(split.dueNow)}</dd></div>
                <div className="flex justify-between"><dt className="text-mist">Balance before delivery</dt><dd>{formatPrice(split.balance)}</dd></div>
                <p className="text-xs text-mist">Pre-order items: {preorderDepositPercent}% now, the rest before we deliver{readyBy ? `. Expected: ${readyBy}` : ""}.</p>
              </>
            ) : (
              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-semibold"><dt>To pay</dt><dd className="text-gold">{total !== undefined ? formatPrice(total) : "—"}</dd></div>
            )}
            {backendOn && readyBy && split?.hasPreorder && <p className="text-xs text-mist">Pre-order items. Expected: {readyBy}.</p>}
          </dl>

          {error && <p role="alert" className="mt-4 rounded-md bg-red-400/10 px-4 py-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
          <button type="button" onClick={startPayment} disabled={placing} className={`${btnPrimary} mt-5 w-full disabled:opacity-60`}>
            {placing ? "Placing your order…" : mode === "manual" ? "Place order" : `Pay${dueNow !== undefined ? ` ${formatPrice(dueNow)}` : ""} with MoMo`}
          </button>
          {mode !== "manual" && (
            <button type="button" onClick={whatsappInstead} disabled={placing} className={`${btnGhost} mt-3 w-full`}>Order on WhatsApp instead</button>
          )}
          <p className="mt-3 text-xs text-mist">
            By placing your order you agree to our <Link href="/terms" className="text-gold underline-offset-4 hover:underline">terms</Link> and <Link href="/delivery-returns" className="text-gold underline-offset-4 hover:underline">returns policy</Link>.
          </p>
        </aside>
      </div>

      {waitingForPhone && (
        <div role="dialog" aria-modal="true" aria-labelledby="wait-title" className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-sm border border-gold/40 bg-navy-deep p-8 text-center shadow-2xl">
            <div aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl">📱</div>
            <h2 id="wait-title" className="mt-5 font-display text-3xl">Approve on your phone</h2>
            <p className="mt-3 text-mist">
              A {network} prompt for <span className="font-semibold text-ivory">{dueNow !== undefined ? formatPrice(dueNow) : "your order"}</span> was sent to{" "}
              <span className="font-semibold text-ivory">{mask(clean(momoPhone))}</span>. Enter your MoMo PIN there. This page continues by itself.
            </p>
          </div>
        </div>
      )}

      {approving && (
        <div role="dialog" aria-modal="true" aria-labelledby="pay-title" className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-sm border border-gold/40 bg-navy-deep p-8 text-center shadow-2xl">
            <div aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl">📱</div>
            <h2 id="pay-title" className="mt-5 font-display text-3xl">Approve on your phone</h2>
            <p className="mt-3 text-mist">
              A {network} prompt for <span className="font-semibold text-ivory">{dueNow !== undefined ? formatPrice(dueNow) : "your order"}</span> would be sent to{" "}
              <span className="font-semibold text-ivory">{mask(clean(momoPhone))}</span>. Enter your MoMo PIN there to confirm.
            </p>
            <p className="mt-4 rounded-md bg-amber-400/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">Demo only: no prompt is sent and no money is charged.</p>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={() => finish("momo")} className={btnPrimary}>Simulate approval</button>
              <button type="button" onClick={() => setApproving(false)} className={btnGhost}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function CheckoutView() {
  const hydrated = useHydrated();
  const account = useCurrentUser();
  if (!hydrated) return <p className="py-24 text-center text-mist">Loading…</p>;
  return <Checkout account={account} />;
}
