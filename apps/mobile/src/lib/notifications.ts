import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { registerPushToken, unregisterPushToken } from "@/lib/api";
import { createStore, useStore } from "@/lib/storage";

/**
 * Notifications in the app.
 *  - A notification centre (the Notifications screen) keeps everything the shop told the customer.
 *  - Local alerts work straight away (for example "Order received" after a demo checkout).
 *  - Real push notifications from the shop reach the phone once the backend is live and Firebase/EAS keys are set
 *    (see apps/backend/ARCHITECTURE.md). The phone registers its address with the backend in enableNotifications().
 */
export type AppNotification = { id: string; at: string; title: string; body: string; url?: string; read: boolean };

export const notificationsStore = createStore<AppNotification[]>("um.notifs", []);

export type NotifyPrefs = {
  /** order updates and replies to requests */
  orders: boolean;
  /** new designs and pre-orders */
  news: boolean;
  permission: "unknown" | "granted" | "denied";
};
export const prefsStore = createStore<NotifyPrefs>("um.notifprefs", { orders: true, news: true, permission: "unknown" });
const tokenStore = createStore<string | null>("um.pushtoken", null);

export const useUnreadCount = () => useStore(notificationsStore).filter((n) => !n.read).length;

const CHANNEL = "default";

/** Storefront links in notifications open the matching screen inside the app. */
export function screenForUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    /* already a path */
  }
  if (path.startsWith("/shop/")) return `/product/${path.split("/")[2]}`;
  if (path === "/pre-order") return "/preorder";
  if (path === "/shop") return "/shop";
  if (path.startsWith("/track") || path.startsWith("/order") || path.startsWith("/account/orders")) return "/orders";
  if (path.startsWith("/custom-style")) return "/custom-style";
  return path.startsWith("/") ? path : undefined;
}

function remember(n: { title: string; body: string; url?: string }) {
  const item: AppNotification = { id: `n_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: new Date().toISOString(), read: false, ...n };
  notificationsStore.update((list) => [item, ...list].slice(0, 100));
}

export const markAllRead = () => notificationsStore.update((l) => l.map((n) => ({ ...n, read: true })));
export const markRead = (id: string) => notificationsStore.update((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
export const clearAll = () => notificationsStore.set([]);

/** Call once near the app root: shows alerts while the app is open, builds the Android channel, handles taps. */
export function useNotificationSetup() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
    });
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync(CHANNEL, {
        name: "Urban Men",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 150, 200],
        lightColor: "#e8b83a",
      }).catch(() => undefined);
    }

    // refresh the permission state (the customer may have changed it in system settings)
    Notifications.getPermissionsAsync()
      .then((p) => prefsStore.update((cur) => ({ ...cur, permission: p.granted ? "granted" : p.canAskAgain ? cur.permission : "denied" })))
      .catch(() => undefined);

    const received = Notifications.addNotificationReceivedListener((n) => {
      const c = n.request.content;
      remember({ title: c.title ?? "Urban Men", body: c.body ?? "", url: (c.data as { url?: string } | undefined)?.url });
    });
    const tapped = Notifications.addNotificationResponseReceivedListener((r) => {
      const target = screenForUrl((r.notification.request.content.data as { url?: string } | undefined)?.url);
      router.push((target ?? "/notifications") as never);
    });
    return () => {
      received.remove();
      tapped.remove();
    };
  }, []);
}

/** Ask permission, then (when the backend is live) register this phone for pushes. */
export async function enableNotifications(): Promise<{ granted: boolean; registered: boolean }> {
  const current = await Notifications.getPermissionsAsync();
  const result = current.granted ? current : await Notifications.requestPermissionsAsync();
  const granted = result.granted;
  prefsStore.update((cur) => ({ ...cur, permission: granted ? "granted" : "denied" }));
  if (!granted || !Device.isDevice) return { granted, registered: false };

  try {
    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ?? Constants.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    tokenStore.set(token.data);
    return { granted, registered: await registerPushToken(token.data) };
  } catch {
    // no EAS project / Firebase keys yet: local alerts still work
    return { granted, registered: false };
  }
}

/** Turning notifications off in the app also removes this phone from the shop's list. */
export async function disableNotifications() {
  const token = tokenStore.get();
  if (token) await unregisterPushToken(token);
  tokenStore.set(null);
}

/** A local alert, shown by the phone itself (works with no backend). Also kept in the notification centre. */
export async function notifyLocally(n: { title: string; body: string; url?: string }, afterSeconds = 1) {
  const prefs = prefsStore.get();
  remember(n);
  if (prefs.permission !== "granted") return;
  await Notifications.scheduleNotificationAsync({
    content: { title: n.title, body: n.body, data: { url: n.url }, sound: "default" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: afterSeconds, channelId: CHANNEL },
  }).catch(() => undefined);
}
