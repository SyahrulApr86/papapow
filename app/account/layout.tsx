import { getFeaturedProducts } from "@/lib/catalog";
import { getUserSession } from "@/lib/user-auth";
import { SiteHeader } from "@/components/site-header";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [products, user] = await Promise.all([
    getFeaturedProducts(),
    getUserSession(),
  ]);
  return (
    <>
      <SiteHeader products={products} user={user} />
      {children}
    </>
  );
}
