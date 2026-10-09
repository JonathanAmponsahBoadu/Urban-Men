import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Urban Men Apparel",
    short_name: "Urban Men",
    description: "Premium African-print menswear from Ghana.",
    start_url: "/",
    display: "standalone",
    background_color: "#1b2231",
    theme_color: "#1b2231",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
