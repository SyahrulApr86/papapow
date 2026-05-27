import { notFound } from "next/navigation";
import { getProductById, getFeaturedProducts } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, allProducts] = await Promise.all([
    getProductById(Number(id)),
    getFeaturedProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <main className="detail-page">
      <SiteHeader products={allProducts} />
      <ProductDetail product={product} related={related} />
    </main>
  );
}
