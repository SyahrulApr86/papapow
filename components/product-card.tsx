"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { isWishlisted, toggleWishlist, WISHLIST_EVENT } from "@/lib/wishlist-store";
import { showToast } from "@/lib/toast-store";

export function ProductCard({
  product,
  onBuy,
}: {
  product: Product;
  onBuy: (p: Product) => void;
}) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isWishlisted(product.id));
    const sync = () => setWishlisted(isWishlisted(product.id));
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_EVENT, sync);
  }, [product.id]);

  return (
    <article className="product-card">
      {product.discount_label && (
        <span className="discount-badge">{product.discount_label}</span>
      )}

      {/* Wishlist quick-action */}
      <button
        className={`card-wishlist-btn${wishlisted ? " active" : ""}`}
        type="button"
        aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
        onClick={() => {
          const added = toggleWishlist({
            productId: product.id,
            name: product.name,
            image: product.main_image,
            price: product.price,
            compare_at_price: product.compare_at_price,
          });
          setWishlisted(added);
          showToast(
            added ? "Ditambahkan ke wishlist" : "Dihapus dari wishlist",
            added ? "success" : "info",
          );
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={wishlisted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <a className="product-image" href={`/products/${product.id}`}>
        <img className="main-img" src={product.main_image} alt={product.name} />
        {product.hover_image && (
          <img className="hover-img" src={product.hover_image} alt="" />
        )}
      </a>

      <a className="card-link card-info" href={`/products/${product.id}`}>
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <div className="price-row">
          {product.compare_at_price && (
            <span className="compare-price">
              {formatRupiah(product.compare_at_price)}
            </span>
          )}
          <strong>{formatRupiah(product.price)}</strong>
        </div>
      </a>

      <button
        className="buy-button"
        type="button"
        onClick={() => onBuy(product)}
      >
        Tambah ke Keranjang
      </button>
    </article>
  );
}
