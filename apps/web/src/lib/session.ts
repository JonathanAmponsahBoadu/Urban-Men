// The sign-in token the shop backend gives a customer. Kept in this browser only (localStorage),
// and sent as "Authorization: Bearer ..." on requests made for a signed-in customer.
const KEY = "um.token";

export function getToken(): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    /* private mode: the customer stays signed in for this page only */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Reads the (unverified) payload of a JWT. Only used to read the profile Google gave us; the server verifies the token. */
export function readJwt(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(part).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}
