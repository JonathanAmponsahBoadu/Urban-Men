/** Public address of the site. Set NEXT_PUBLIC_SITE_URL in the deployment environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
