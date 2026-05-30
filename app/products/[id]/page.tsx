import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById, getFeaturedProducts } from "@/lib/catalog";
import { formatRupiah } from "@/lib/catalog";
import { getUserSession } from "@/lib/user-auth";
import { getSetting } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { ProductDetail } from "@/components/product-detail";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Produk tidak ditemukan" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://papapow.vercel.app";
  const description =
    product.description ||
    `${product.name} — ${product.category} dari PAPAPOW. ${formatRupiah(product.price)}.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | PAPAPOW`,
      description,
      url: `${siteUrl}/products/${product.id}`,
      type: "website",
      siteName: "PAPAPOW",
    },
    alternates: { canonical: `${siteUrl}/products/${product.id}` },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, allProducts, user, waNumber] = await Promise.all([
    getProductById(Number(id)),
    getFeaturedProducts(),
    getUserSession(),
    getSetting("wa_number", "6281234567890"),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://papapow.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} dari PAPAPOW`,
    brand: { "@type": "Brand", name: "PAPAPOW" },
    category: product.category,
    url: `${siteUrl}/products/${product.id}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "PAPAPOW" },
    },
    ...(product.material && { material: product.material }),
  };

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader products={allProducts} user={user} />
      <ProductDetail product={product} related={related} waNumber={waNumber} />
      <SiteFooter />
    </main>
  );
}
