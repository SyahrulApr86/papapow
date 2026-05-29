import { getProducts } from "@/lib/catalog";
import { getUserSession } from "@/lib/user-auth";
import { SiteHeader } from "@/components/site-header";
import { AllProductsGrid } from "@/components/all-products-grid";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const [products, user, { category, q }] = await Promise.all([
    getProducts(),
    getUserSession(),
    searchParams,
  ]);

  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <main>
      <SiteHeader products={products} user={user} />
      <AllProductsGrid
        products={products}
        categories={categories}
        activeCategory={category}
        searchQuery={q}
      />
      <SiteFooter />
    </main>
  );
}
