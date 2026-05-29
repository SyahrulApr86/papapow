"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/lib/db";
import { AddToCartModal } from "./add-to-cart-modal";
import { ProductCard } from "./product-card";

export function AllProductsGrid({
  products,
  categories,
  activeCategory,
  searchQuery,
}: {
  products: Product[];
  categories: string[];
  activeCategory?: string;
  searchQuery?: string;
}) {
  const [category, setCategory] = useState(activeCategory ?? "semua");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState(searchQuery ?? "");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (category !== "semua") {
      list = list.filter((p) => p.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (sort === "featured") return [...list].sort((a, b) => a.sort_order - b.sort_order);
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, sort, query]);

  return (
    <>
      <section className="all-products-section">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="breadcrumb-sep">›</span>
          <span>Semua Produk</span>
        </nav>

        {/* Header */}
        <div className="all-products-header">
          <div>
            <h1 className="all-products-title">Semua Produk</h1>
            <p className="all-products-count">{filtered.length} produk ditemukan</p>
          </div>
        </div>

        {/* Sticky Filters */}
        <div className="all-products-filters">
          <div className="filter-category-bar">
            <button
              className={`filter-cat-btn${category === "semua" ? " active" : ""}`}
              onClick={() => setCategory("semua")}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-cat-btn${category === cat ? " active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-right">
            <div className="filter-search-wrap">
              <svg className="filter-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                className="filter-search"
                placeholder="Cari..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Unggulan</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="name">Nama A-Z</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="all-products-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{ fontWeight: 600, margin: 0 }}>Tidak ada produk ditemukan</p>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>Coba ubah filter atau kata kunci pencarian.</p>
            <button
              className="filter-cat-btn active"
              style={{ marginTop: 8 }}
              onClick={() => { setCategory("semua"); setQuery(""); }}
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="product-grid product-grid--fill">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={setModalProduct}
              />
            ))}
          </div>
        )}
      </section>

      {modalProduct && (
        <AddToCartModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  );
}
