"use client";

import { useState } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { AddToCartModal } from "./add-to-cart-modal";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="product-grid">
        {products.map(product => (
          <article className="product-card" key={product.id}>
            {product.discount_label ? (
              <span className="discount-badge">{product.discount_label}</span>
            ) : null}
            <a className="product-image" href={`/products/${product.id}`}>
              <img className="main-img" src={product.main_image} alt={product.name} />
              {product.hover_image ? (
                <img className="hover-img" src={product.hover_image} alt="" />
              ) : null}
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
            <button
              className="buy-button"
              type="button"
              onClick={() => setModalProduct(product)}
            >
              Beli
            </button>
          </article>
        ))}
      </div>

      {modalProduct && (
        <AddToCartModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  );
}
