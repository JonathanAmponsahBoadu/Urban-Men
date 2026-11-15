/**
 * Thin client for the Urban Men backend (Medusa). The apps run on their own bundled data until the backend is
 * deployed; set EXPO_PUBLIC_API_URL (and EXPO_PUBLIC_PUBLISHABLE_KEY) in apps/mobile/.env to switch calls on.
 */
const BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
const KEY = process.env.EXPO_PUBLIC_PUBLISHABLE_KEY;

export const backendConfigured = Boolean(BASE);

async function call(path: string, init: RequestInit & { json?: unknown } = {}) {
  if (!BASE) return undefined;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { "x-publishable-api-key": KEY } : {}),
      ...(init.headers ?? {}),
    },
    body: init.json === undefined ? init.body : JSON.stringify(init.json),
  });
  return res.ok;
}

/** Tell the shop this phone wants notifications (POST /store/push-tokens). Resolves false when no backend is set. */
export async function registerPushToken(token: string): Promise<boolean> {
  try {
    return (await call("/store/push-tokens", { method: "POST", json: { token, platform: "android" } })) === true;
  } catch {
    return false;
  }
}

export async function unregisterPushToken(token: string): Promise<void> {
  try {
    await call("/store/push-tokens", { method: "DELETE", json: { token, platform: "android" } });
  } catch {
    /* offline: the shop removes dead tokens on its own */
  }
}
