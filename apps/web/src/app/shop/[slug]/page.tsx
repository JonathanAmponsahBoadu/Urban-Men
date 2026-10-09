import type { Metadata } from "next";
import { ProductView } from "@/components/ProductView";
import { getProduct, getProducts } from "@/lib/catalogue";
import { totalStock } from "@/lib/format";
import { SITE_URL } from "@/lib/siteUrl";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return { title: "Shirt" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: { title: product.name, description: product.description, images: product.images.slice(0, 1).map((i) => ({ url: i.src, alt: i.alt })) },
  };
}

// Products the admin adds in the browser have no pre-rendered page: the client
// looks them up, so we render for any slug and let ProductView show "not found".
export default async function ProductPage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  // structured data for search engines (built-in products only; admin-added ones have no server copy)
  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    image: product.images.map((i) => `${SITE_URL}${i.src}`),
    brand: { "@type": "Brand", name: "Urban Men Apparel" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.slug}`,
      priceCurrency: "GHS",
      ...(product.price !== undefined ? { price: product.price.toFixed(2) } : {}),
      availability: totalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <ProductView slug={slug} />
    </>
  );
}
