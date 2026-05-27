import { getFeaturedProducts } from "@/lib/catalog";
import { SiteHeader } from "@/components/site-header";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const products = await getFeaturedProducts();
  return (
    <>
      <SiteHeader products={products} />
      {children}
    </>
  );
}
