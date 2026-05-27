"use client";

import { useState } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";

export function AddToCartModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] ?? "",
  );
  const [qty, setQty] = useState(1);

  return (
    <div className="atc-backdrop" onClick={onClose} aria-modal="true" role="dialog" aria-label="Tambah Ke Keranjang">
      <div className="atc-sheet" onClick={e => e.stopPropagation()}>
        <div className="atc-header">
          <span className="atc-title">Tambah Ke Keranjang</span>
          <button className="atc-close icon-btn" aria-label="Tutup" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <a className="atc-product-row" href={`/products/${product.id}`}>
          <div className="atc-product-img">
            <img src={product.image_url} alt={product.name} />
          </div>
          <span className="atc-product-name">{product.name}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="atc-product-arrow">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>

        {product.sizes?.length > 0 && (
          <div className="atc-section">
            <p className="atc-section-label">Ukuran</p>
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

        <div className="atc-divider" />

        <div className="atc-qty-row">
          <button
            className="atc-qty-btn"
            type="button"
            onClick={() => setQty(q => Math.max(1, q - 1))}
            aria-label="Kurangi"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span className="atc-qty-val">{qty}</span>
          <button
            className="atc-qty-btn"
            type="button"
            onClick={() => setQty(q => q + 1)}
            aria-label="Tambah"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <button className="atc-submit" type="button" onClick={onClose}>
          Tambah Ke Keranjang
        </button>
      </div>
    </div>
  );
}
