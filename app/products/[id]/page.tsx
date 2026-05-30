import { notFound } from "next/navigation";
import { getProductById, getFeaturedProducts } from "@/lib/catalog";
import { getUserSession } from "@/lib/user-auth";
import { getSetting } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { ProductDetail } from "@/components/product-detail";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

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

  return (
    <main className="detail-page">
      <SiteHeader products={allProducts} user={user} />
      <ProductDetail product={product} related={related} waNumber={waNumber} />
      <SiteFooter />
    </main>
  );
}
