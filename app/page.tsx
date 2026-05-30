import { getBanners, getFeaturedProducts } from "@/lib/catalog";
import { getUserSession } from "@/lib/user-auth";
import { SiteHeader } from "@/components/site-header";
import { CatalogGrid } from "@/components/catalog-grid";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, banners, user] = await Promise.all([
    getFeaturedProducts(),
    getBanners(),
    getUserSession(),
  ]);
  const hero = banners.find((banner) => banner.placement === "hero");
  const bottom = banners.find((banner) => banner.placement === "bottom");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://papapow.vercel.app";
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PAPAPOW",
    url: siteUrl,
    logo: `${siteUrl}/images/logo-black.png`,
    description: "Monochrome goods for daily motion. Fashion catalog dari Jakarta.",
    address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <SiteHeader products={products} user={user} />

      <section className="hero" style={{ backgroundImage: `url(${hero?.image_url})` }}>
        <div className="hero-copy">
          <img src="/images/logo-white.jpg" alt="PAPAPOW" className="hero-logo" />
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <h2>ALL COLLECTION</h2>
        <CatalogGrid products={products} />
        <a className="primary-cta" href="/products">
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

      <SiteFooter />
    </main>
  );
}
