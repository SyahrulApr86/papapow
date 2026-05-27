import { getBanners, getFeaturedProducts } from "@/lib/catalog";
import { PapapowLogo } from "@/components/papapow-logo";
import { SiteHeader } from "@/components/site-header";
import { CatalogGrid } from "@/components/catalog-grid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, banners] = await Promise.all([
    getFeaturedProducts(),
    getBanners(),
  ]);
  const hero = banners.find((banner) => banner.placement === "hero");
  const bottom = banners.find((banner) => banner.placement === "bottom");

  return (
    <main>
      <SiteHeader products={products} />

      <section className="hero" style={{ backgroundImage: `url(${hero?.image_url})` }}>
        <div className="hero-copy">
          <PapapowLogo />
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <h2>ALL COLLECTION</h2>
        <CatalogGrid products={products} />
        <a className="primary-cta" href="#catalog">
          SEE ALL PRODUCT
        </a>
      </section>

      {bottom ? (
        <section
          className="bottom-banner"
          style={{ backgroundImage: `url(${bottom.image_url})` }}
        >
          <div>
            <p>{bottom.subtitle}</p>
            <h2>{bottom.title}</h2>
            {bottom.cta_label ? (
              <a href={bottom.cta_href ?? "#catalog"}>{bottom.cta_label}</a>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
