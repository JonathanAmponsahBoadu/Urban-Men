import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/siteUrl";

const pages = ["", "/shop", "/lookbook", "/custom-style", "/size-guide", "/about", "/contact", "/faq", "/delivery-returns", "/track", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${SITE_URL}/shop/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
