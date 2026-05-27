import { getBanners, getFeaturedProducts, formatRupiah } from "@/lib/catalog";
import { PapapowLogo } from "@/components/papapow-logo";

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
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand-mark" href="/">
          <PapapowLogo compact />
        </a>
        <nav className="header-actions" aria-label="Shop actions">
          <a aria-label="Wishlist" href="#catalog">
            ♡
          </a>
          <a aria-label="Cart" href="#catalog">
            🛒
          </a>
        </nav>
      </header>

      <section className="hero" style={{ backgroundImage: `url(${hero?.image_url})` }}>
        <div className="hero-copy">
          <PapapowLogo />
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <h2>ALL COLLECTION</h2>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              {product.discount_label ? (
                <span className="discount-badge">{product.discount_label}</span>
              ) : null}
              <a className="product-image" href={`/products/${product.id}`}>
                <img src={product.image_url} alt={product.name} />
              </a>
              <a href={`/products/${product.id}`}>
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
              </a>
              <div className="price-row">
                {product.compare_at_price ? (
                  <span className="compare-price">
                    {formatRupiah(product.compare_at_price)}
                  </span>
                ) : null}
                <strong>{formatRupiah(product.price)}</strong>
              </div>
              <a className="buy-button" href={`/products/${product.id}`}>
                Beli
              </a>
            </article>
          ))}
        </div>
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
