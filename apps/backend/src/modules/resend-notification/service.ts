import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import type { Logger, NotificationTypes } from "@medusajs/framework/types";
import { renderEmail } from "./templates";

type Options = {
  /** Resend API key (re_...). https://resend.com */
  apiKey: string;
  /** Sender, e.g. "Urban Men <orders@yourdomain.com>". Must be on a domain verified in Resend. */
  from: string;
};

/** Sends our branded emails through Resend (free plan: 3,000 emails a month). */
class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend";

  protected readonly options_: Options;
  protected readonly logger_?: Logger;

  constructor(container: { logger?: Logger }, options: Options) {
    super();
    this.options_ = options;
    this.logger_ = container.logger;
  }

  static validateOptions(options: Record<string, unknown>): void | never {
    if (!options.apiKey || !options.from) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "RESEND_API_KEY and NOTIFICATION_FROM are required for the Resend email provider");
    }
  }

  async send(notification: NotificationTypes.ProviderSendNotificationDTO): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const { subject, html } = renderEmail(notification.template, (notification.data ?? {}) as Record<string, unknown>);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.options_.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: notification.from ?? this.options_.from, to: [notification.to], subject, html }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      this.logger_?.error(`Resend email to ${notification.to} failed: ${json.message ?? res.status}`);
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Email could not be sent: ${json.message ?? res.status}`);
    }
    return { id: json.id };
  }
}

export default ResendNotificationProviderService;
