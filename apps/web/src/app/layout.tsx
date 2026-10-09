import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans } from "next/font/google";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { BottomNav } from "@/components/BottomNav";
import { CatalogueProvider } from "@/components/CatalogueProvider";
import { ConsentBanner } from "@/components/ConsentBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "@/components/Toaster";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getProducts } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Urban Men Apparel — Signature Collections",
    template: "%s | Urban Men Apparel",
  },
  description:
    "Premium African-print menswear from Ghana. Professional, timeless, authentic. Order on WhatsApp.",
  applicationName: "Urban Men Apparel",
  openGraph: {
    type: "website",
    siteName: "Urban Men Apparel",
    title: "Urban Men Apparel — Signature Collections",
    description: "Premium African-print shirts from Ghana, each coming with matching trousers.",
    images: [{ url: "/images/products/green-kente-shirt.jpg", width: 928, height: 1152, alt: "Urban Men shirt" }],
  },
  twitter: { card: "summary_large_image" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "Urban Men Apparel",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-wordmark-gold.png`,
  telephone: "+233550095440",
  sameAs: ["https://www.instagram.com/urban_men_apparel"],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const baseProducts = await getProducts();
  return (
    <html lang="en" className={`${bodoni.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <CatalogueProvider base={baseProducts}>
          <a href="#main-content" className="sr-only z-100 rounded-md bg-gold px-4 py-2 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            Skip to content
          </a>
          <AnnouncementBar />
          <SiteHeader />
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <SiteFooter />
          <BottomNav />
          <WhatsAppFab />
          <Toaster />
          <ConsentBanner />
        </CatalogueProvider>
      </body>
    </html>
  );
}
