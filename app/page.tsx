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
          <span className="currency-badge">IDR</span>
          <a aria-label="Wishlist" href="#catalog" className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </a>
          <a aria-label="Cart" href="#catalog" className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </a>
          <a aria-label="Account" href="/admin" className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
          <a className="search-pill" href="#catalog">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="search-text">Cari</span>
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
              <a className="card-link" href={`/products/${product.id}`}>
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
