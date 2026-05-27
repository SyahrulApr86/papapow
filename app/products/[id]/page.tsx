import { notFound } from "next/navigation";
import { getProductById, formatRupiah } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    notFound();
  }

  const allImages = product.images?.length
    ? product.images
    : [product.image_url];

  return (
    <main className="detail-page">
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand-mark" href="/">
          PAPAPOW
        </a>
        <nav className="header-actions" aria-label="Shop actions">
          <a aria-label="Wishlist" href="/">
            ♡
          </a>
          <a aria-label="Cart" href="/">
            🛒
          </a>
        </nav>
      </header>

      <div className="detail-layout">
        <section className="detail-images">
          {allImages.map((url, i) => (
            <img key={i} src={url} alt={`${product.name} ${i + 1}`} />
          ))}
        </section>

        <section className="detail-info">
          <p className="product-category">{product.category}</p>
          <h1>{product.name}</h1>

          <div className="detail-price">
            {product.compare_at_price ? (
              <span className="compare-price">
                {formatRupiah(product.compare_at_price)}
              </span>
            ) : null}
            <strong className="current-price">
              {formatRupiah(product.price)}
            </strong>
          </div>

          {product.sizes?.length ? (
            <fieldset className="size-picker">
              <legend>Ukuran</legend>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <label key={size} className="size-option">
                    <input type="radio" name="size" value={size} />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <button className="buy-button detail-buy">Beli</button>

          {product.description ? (
            <div className="detail-description">
              <h4>Deskripsi</h4>
              <p>{product.description}</p>
            </div>
          ) : null}

          {product.material ? (
            <div className="detail-material">
              <h4>Material</h4>
              <p>{product.material}</p>
            </div>
          ) : null}

          {product.weight ? (
            <p className="detail-weight">Berat: {product.weight}g</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
