import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils";
import type { Logger, NotificationTypes } from "@medusajs/framework/types";

type Options = {
  /** Optional Expo access token (enhanced push security). Not needed to start. */
  accessToken?: string;
};

type ExpoTicket = { status: "ok" | "error"; id?: string; message?: string; details?: { error?: string } };

/**
 * In-app push notifications for the mobile app, through Expo's push service (free).
 * `to` is the device's Expo push token. The notification `data` carries { title, body, url }.
 */
class ExpoPushProviderService extends AbstractNotificationProviderService {
  static identifier = "expo-push";

  protected readonly options_: Options;
  protected readonly logger_?: Logger;

  constructor(container: { logger?: Logger }, options: Options = {}) {
    super();
    this.options_ = options;
    this.logger_ = container.logger;
  }

  async send(notification: NotificationTypes.ProviderSendNotificationDTO): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const d = (notification.data ?? {}) as { title?: string; body?: string; url?: string };
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(this.options_.accessToken ? { Authorization: `Bearer ${this.options_.accessToken}` } : {}),
      },
      body: JSON.stringify({
        to: notification.to,
        title: d.title ?? "Urban Men",
        body: d.body ?? "",
        data: { url: d.url },
        sound: "default",
        priority: "high",
        channelId: "default",
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { data?: ExpoTicket };
    const ticket = json.data;
    if (!res.ok || !ticket || ticket.status === "error") {
      // DeviceNotRegistered means the app was removed: the caller cleans the token up.
      this.logger_?.warn(`Expo push failed for ${notification.to}: ${ticket?.message ?? res.status}`);
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Push could not be sent: ${ticket?.details?.error ?? ticket?.message ?? res.status}`);
    }
    return { id: ticket.id };
  }
}

export default ExpoPushProviderService;
