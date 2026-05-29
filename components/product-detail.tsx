"use client";

import { useState } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { AddToCartModal } from "./add-to-cart-modal";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const allImages = [
    product.main_image,
    product.hover_image,
    ...product.extra_images,
  ].filter(Boolean) as string[];
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="detail-layout">
        {/* ── Image gallery ── */}
        <section className="detail-images">
          <div className="detail-main-img">
            <img src={allImages[activeImg]} alt={product.name} />
          </div>
          {allImages.length > 1 && (
            <div className="detail-thumbs">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={`detail-thumb${activeImg === i ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Gambar ${i + 1}`}
                >
                  <img src={url} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Product info ── */}
        <section className="detail-info">
          <div className="detail-stock-row">
            <span className="detail-stock-badge">Ada Stok</span>
            <button className="detail-wishlist-btn icon-btn" aria-label="Tambah ke Wishlist">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-price">
            {product.compare_at_price ? (
              <span className="compare-price">{formatRupiah(product.compare_at_price)}</span>
            ) : null}
            <strong className="current-price">{formatRupiah(product.price)}</strong>
          </div>

          {product.sizes?.length > 0 && (
            <div className="detail-section">
              <p className="detail-section-label">Ukuran</p>
              <div className="atc-sizes">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    type="button"
                    className={`atc-size-btn${selectedSize === size ? " active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="detail-divider" />

          <div className="detail-qty-row">
            <button
              type="button"
              className="atc-qty-btn"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              aria-label="Kurangi"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span className="atc-qty-val">{qty}</span>
            <button
              type="button"
              className="atc-qty-btn"
              onClick={() => setQty(q => q + 1)}
              aria-label="Tambah"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <div className="detail-cta-stack">
            <button className="detail-atc-btn" type="button" onClick={() => setModalOpen(true)}>
              Tambah Ke Keranjang
            </button>
            <button className="detail-buy-now-btn" type="button">
              Beli Sekarang
            </button>
          </div>

          {product.description && (
            <div className="detail-section">
              <p className="detail-section-label">Deskripsi :</p>
              <p className="detail-section-text">{product.description}</p>
            </div>
          )}

          {product.material && (
            <div className="detail-section">
              <p className="detail-section-label">Material :</p>
              <p className="detail-section-text">{product.material}</p>
            </div>
          )}

          {product.weight ? (
            <div className="detail-shipping-card">
              <p className="detail-shipping-title">Pengiriman</p>
              <div className="detail-shipping-row">
                <span className="detail-shipping-key">Berat:</span>
                <span className="detail-shipping-val">{product.weight}g</span>
              </div>
              <div className="detail-shipping-row">
                <span className="detail-shipping-key">Dikirim dalam 24 jam,</span>
              </div>
              <div className="detail-shipping-row">
                <span className="detail-shipping-key detail-shipping-note">(Setelah pembayaran dikonfirmasi)</span>
              </div>
            </div>
          ) : null}

          <a
            className="detail-chat-btn"
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Kirim Pesan ke PAPAPOW?
          </a>
        </section>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className="detail-related">
          <h2 className="detail-related-title">Rekomendasi lainnya</h2>
          <div className="detail-related-grid">
            {related.map(p => (
              <a key={p.id} className="detail-related-card" href={`/products/${p.id}`}>
                <div className="detail-related-img">
                  <img src={p.main_image} alt={p.name} />
                </div>
                <p className="detail-related-name">{p.name}</p>
                <div className="detail-related-price">
                  {p.compare_at_price && (
                    <span className="compare-price">{formatRupiah(p.compare_at_price)}</span>
                  )}
                  <strong>{formatRupiah(p.price)}</strong>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {modalOpen && (
        <AddToCartModal product={product} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
