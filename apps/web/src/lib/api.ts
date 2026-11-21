// Talks to the Medusa store API. The site stays fully usable without it: when the two environment variables
// below are not set, everything runs on the built-in demo data (see lib/catalogue.ts and lib/stores.ts).
import { clearToken, getToken } from "@/lib/session";

export const API_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace(/\/$/, "") ?? "";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

/** True when this build is connected to the shop backend. */
export const backendOn = Boolean(API_URL && PUBLISHABLE_KEY);

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** seconds the server may cache a GET (server components only) */
  revalidate?: number;
  /** send the signed-in customer's token (if there is one) so the request is made for them */
  auth?: boolean;
  /** send this token instead (used while a sign-in is being finished) */
  token?: string;
};

/** Calls the backend (`/store/...`, `/auth/...`) and returns the JSON. Throws ApiError with a readable message. */
export async function storeApi<T>(path: string, { method = "GET", body, revalidate, auth, token }: Options = {}): Promise<T> {
  const bearer = token ?? (auth ? getToken() : null);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(revalidate === undefined ? { cache: "no-store" as const } : { next: { revalidate } }),
    });
  } catch {
    throw new ApiError("We could not reach the shop server. Please check your connection and try again.", 0);
  }
  const json = (await res.json().catch(() => undefined)) as (T & { message?: string }) | undefined;
  if (res.status === 401 && auth && bearer) {
    clearToken(); // the sign-in expired: the next request goes out as a guest
    throw new ApiError("Your sign-in has expired. Please sign in again.", 401);
  }
  if (!res.ok || !json) throw new ApiError(json?.message ?? `The shop server returned an error (${res.status}).`, res.status);
  return json;
}

/**
 * Wakes the backend if it is asleep (a free host stops it when nobody is using it, and it takes a little while to start).
 * Called when someone opens the cart, checkout or sign-in, so it is awake by the time they press the button.
 */
export function warmBackend() {
  if (!backendOn) return;
  fetch(`${API_URL}/health`, { mode: "no-cors", cache: "no-store" }).catch(() => undefined);
}
