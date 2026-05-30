"use client";

import { useState } from "react";
import type { Product } from "@/lib/db";
import { AddToCartModal } from "./add-to-cart-modal";
import { ProductCard } from "./product-card";

export function CatalogGrid({ products }: { products: Product[] }) {
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  return (
    <>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onBuy={setModalProduct}
          />
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
