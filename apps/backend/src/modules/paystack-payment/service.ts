import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils";
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

type Options = {
  /** Paystack secret key (sk_test_… while testing). Never expose this to the storefront. */
  secretKey: string;
  /** Override for tests. */
  baseUrl?: string;
};

/** What the storefront sends when it starts a payment session. */
export type PaystackSessionData = {
  /** Mobile Money number to charge, e.g. 0244123456. Leave out to use Paystack's hosted page. */
  phone?: string;
  /** "MTN MoMo" | "Telecel Cash" | "AT Money" (or the Paystack codes mtn | vod | atl). */
  network?: string;
  /** Customer email; Paystack requires one. Falls back to the customer on the cart. */
  email?: string;
};

const PROVIDER_CODES: Record<string, "mtn" | "vod" | "atl"> = {
  "mtn momo": "mtn",
  mtn: "mtn",
  "telecel cash": "vod",
  telecel: "vod",
  vod: "vod",
  "at money": "atl",
  airteltigo: "atl",
  atl: "atl",
};

type PaystackEnvelope<T> = { status: boolean; message: string; data: T };
type ChargeData = { status: string; reference: string; display_text?: string; amount?: number; metadata?: Record<string, unknown> };
type VerifyData = { status: string; reference: string; amount: number; metadata?: Record<string, unknown> | string | null };

/**
 * Paystack as a Medusa payment provider, built for Ghana Mobile Money.
 *
 * Two ways to pay, chosen by what the storefront puts in the session data:
 *  1. phone + network  -> we call Paystack's Charge API; the customer gets an approval prompt on their phone.
 *  2. nothing          -> we create a hosted checkout (authorization_url) that offers Mobile Money and cards.
 *
 * Paystack takes the money immediately, so a successful payment is reported as "captured".
 * The webhook (charge.success) is the reliable confirmation; the storefront also re-checks with verify.
 */
class PaystackPaymentProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "paystack";

  protected readonly options_: Options;

  constructor(container: Record<string, unknown>, options: Options) {
    super(container, options);
    this.options_ = options;
  }

  static validateOptions(options: Record<string, unknown>): void | never {
    if (!options.secretKey || typeof options.secretKey !== "string") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "PAYSTACK_SECRET_KEY is required to use the Paystack payment provider");
    }
  }

  private async api<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.options_.baseUrl ?? "https://api.paystack.co"}${path}`, {
      method,
      headers: { Authorization: `Bearer ${this.options_.secretKey}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = (await res.json().catch(() => undefined)) as PaystackEnvelope<T> | undefined;
    if (!res.ok || !json?.status) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Paystack: ${json?.message ?? `request failed (${res.status})`}`);
    }
    return json.data;
  }

  /** Paystack works in the smallest unit: pesewas. */
  private toPesewas(amount: unknown): number {
    return Math.round(Number(amount) * 100);
  }

  private mapStatus(status: string): PaymentSessionStatus {
    switch (status) {
      case "success":
        return "captured";
      case "failed":
      case "abandoned":
      case "reversed":
        return "error";
      default:
        // pay_offline, send_otp, ongoing, pending, queued ...: waiting for the customer
        return "pending";
    }
  }

  private async verify(reference: string): Promise<VerifyData> {
    return this.api<VerifyData>("GET", `/transaction/verify/${encodeURIComponent(reference)}`);
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const data = (input.data ?? {}) as PaystackSessionData & { session_id?: string };
    const email = data.email ?? input.context?.customer?.email;
    if (!email) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "An email is needed to start a Paystack payment");
    }
    const reference = `um_${data.session_id ?? randomUUID()}`.replace(/[^A-Za-z0-9._=-]/g, "");
    const amount = this.toPesewas(input.amount);
    const currency = input.currency_code.toUpperCase();
    const metadata = { session_id: data.session_id };

    if (data.phone && data.network) {
      const provider = PROVIDER_CODES[data.network.trim().toLowerCase()];
      if (!provider) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Unknown Mobile Money network "${data.network}"`);
      }
      const charge = await this.api<ChargeData>("POST", "/charge", {
        email,
        amount,
        currency,
        reference,
        metadata,
        mobile_money: { phone: data.phone.replace(/\s|-/g, ""), provider },
      });
      return {
        id: reference,
        status: this.mapStatus(charge.status),
        data: { reference, mode: "momo", provider, phone: data.phone, charge_status: charge.status, display_text: charge.display_text ?? "Approve the payment on your phone." },
      };
    }

    const init = await this.api<{ authorization_url: string; access_code: string; reference: string }>("POST", "/transaction/initialize", {
      email,
      amount,
      currency,
      reference,
      metadata,
      channels: ["mobile_money", "card"],
    });
    return { id: reference, status: "pending", data: { reference, mode: "hosted", authorization_url: init.authorization_url, access_code: init.access_code } };
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const status = await this.getPaymentStatus(input);
    return { status: status.status, data: input.data };
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const reference = input.data?.reference as string | undefined;
    if (!reference) return { status: "pending", data: input.data };
    try {
      const v = await this.verify(reference);
      return { status: this.mapStatus(v.status), data: { ...input.data, charge_status: v.status } };
    } catch {
      // not found yet on Paystack's side: still waiting for the customer
      return { status: "pending", data: input.data };
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // Paystack charges are captured the moment the customer approves.
    return { data: input.data };
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const reference = input.data?.reference as string | undefined;
    if (!reference) throw new MedusaError(MedusaError.Types.INVALID_DATA, "No Paystack reference on this payment");
    await this.api("POST", "/refund", { transaction: reference, amount: this.toPesewas(input.amount) });
    return { data: { ...input.data, refunded: true } };
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const reference = input.data?.reference as string | undefined;
    if (!reference) return { data: input.data };
    const v = await this.verify(reference);
    return { data: { ...input.data, charge_status: v.status } };
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // A Mobile Money prompt cannot be recalled; an unapproved one simply expires.
    return { data: input.data };
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data };
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // The amount of a started Paystack charge cannot change; a new session is created instead.
    return { data: input.data };
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const signature = String(payload.headers["x-paystack-signature"] ?? "");
    const expected = createHmac("sha512", this.options_.secretKey).update(payload.rawData).digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { action: "not_supported" };
    }

    const event = payload.data.event as string | undefined;
    const body = payload.data.data as { reference?: string; amount?: number; metadata?: { session_id?: string } | null } | undefined;
    const sessionId = body?.metadata?.session_id;
    if (!sessionId || body?.amount === undefined) return { action: "not_supported" };

    const data = { session_id: sessionId, amount: body.amount / 100 };
    if (event === "charge.success") return { action: "captured", data };
    if (event === "charge.failed") return { action: "failed", data };
    return { action: "not_supported" };
  }
}

export default PaystackPaymentProviderService;
