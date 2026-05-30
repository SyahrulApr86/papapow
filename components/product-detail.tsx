"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { AddToCartModal } from "./add-to-cart-modal";
import { isWishlisted, toggleWishlist, WISHLIST_EVENT } from "@/lib/wishlist-store";
import { showToast } from "@/lib/toast-store";

export function ProductDetail({
  product,
  related,
  waNumber = "6281234567890",
}: {
  product: Product;
  related: Product[];
  waNumber?: string;
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
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isWishlisted(product.id));
    const sync = () => setWishlisted(isWishlisted(product.id));
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_EVENT, sync);
  }, [product.id]);

  return (
    <>
      {/* Breadcrumb */}
      <nav className="breadcrumb detail-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span className="breadcrumb-sep">›</span>
        <a href="/products">Semua Produk</a>
        <span className="breadcrumb-sep">›</span>
        <span>{product.name}</span>
      </nav>

      <div className="detail-layout">
        {/* ── Image gallery ── */}
        <section className="detail-images">
          <div className="detail-main-img">
            <img src={allImages[activeImg]} alt={product.name} decoding="async" />
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
                  <img src={url} alt={`${product.name} ${i + 1}`} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Product info ── */}
        <section className="detail-info">
          <div className="detail-stock-row">
            <span className="detail-stock-badge">Ada Stok</span>
            <button
              className={`detail-wishlist-btn icon-btn${wishlisted ? " wishlisted" : ""}`}
              aria-label={wishlisted ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
              onClick={() => {
                const added = toggleWishlist({
                  productId: product.id,
                  name: product.name,
                  image: product.main_image,
                  price: product.price,
                  compare_at_price: product.compare_at_price,
                });
                setWishlisted(!wishlisted);
                showToast(added ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist", added ? "success" : "info");
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
            <a
              className="detail-buy-now-btn"
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya mau beli ${product.name}${selectedSize ? ` ukuran ${selectedSize}` : ""}. Apakah masih tersedia?`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Beli Sekarang
            </a>
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
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang produk ${product.name}.`)}`}
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
                  <img src={p.main_image} alt={p.name} loading="lazy" decoding="async" />
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
