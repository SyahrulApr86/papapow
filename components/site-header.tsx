"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { getCart, removeFromCart, updateQty, CART_EVENT, type CartItem } from "@/lib/cart-store";
import { getWishlist, WISHLIST_EVENT, type WishlistItem } from "@/lib/wishlist-store";
import { showToast } from "@/lib/toast-store";

type User = { id: number; email: string; name: string };

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "ALL PRODUCT", href: "/products" },
  { label: "CATALOG", href: "/products" },
  { label: "SALE", href: "/products", highlight: true },
];

export function SiteHeader({ products = [], user }: { products?: Product[]; user?: User | null }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setCartItems(getCart());
    setWishlistItems(getWishlist());
    const syncCart = () => setCartItems(getCart());
    const syncWish = () => setWishlistItems(getWishlist());
    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);
    window.addEventListener(WISHLIST_EVENT, syncWish);
    window.addEventListener("storage", syncWish);
    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(WISHLIST_EVENT, syncWish);
      window.removeEventListener("storage", syncWish);
    };
  }, []);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const wishlistCount = wishlistItems.length;

  const closeAll = () => {
    setNavOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  };

  return (
    <>
      <header className="site-header" aria-label="Primary navigation">
        <div className="header-left">
          <button className="hamburger-btn" aria-label="Menu" onClick={() => { closeAll(); setNavOpen(true); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <a className="brand-mark" href="/">
          <img src="/images/logo-black.png" alt="PAPAPOW" className="brand-logo-img" />
        </a>

        <nav className="header-actions" aria-label="Shop actions">
          <span className="currency-badge">IDR</span>
          <a aria-label="Wishlist" href="/account?tab=wishlist" className="icon-btn cart-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {wishlistCount > 0 && (
              <span className="cart-badge">{wishlistCount > 99 ? "99+" : wishlistCount}</span>
            )}
          </a>
          <button aria-label="Cart" className="icon-btn cart-icon-btn" onClick={() => { closeAll(); setCartOpen(true); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </button>
          <a aria-label="Account" href="/account" className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
          <button className="search-pill" onClick={() => { closeAll(); setSearchOpen(true); }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="search-text">Cari</span>
          </button>
        </nav>
      </header>

      {/* Search overlay */}
      {searchOpen && (() => {
        const popularTags = [...new Set(products.map(p => p.category))].slice(0, 8);
        const searchResults = searchQuery.trim().length >= 1
          ? products.filter(p =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 12)
          : [];
        return (
          <div className="search-overlay" role="dialog" aria-label="Search">
            <div className="search-overlay-bar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-overlay-icon">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                autoFocus
                type="search"
                placeholder="Cari Produk Kami"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape") setSearchOpen(false);
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="search-overlay-input"
              />
              <button aria-label="Tutup pencarian" onClick={() => setSearchOpen(false)} className="search-overlay-close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="search-overlay-body">
              {searchResults.length > 0 ? (
                <>
                  <p className="search-popular-label">Produk <span style={{fontWeight:400,color:"var(--muted)"}}>— {searchResults.length} hasil ditemukan</span></p>
                  <div className="search-results-list">
                    {searchResults.map(p => (
                      <a
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="search-result-item"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div className="search-result-img">
                          <img src={p.main_image} alt={p.name} loading="lazy" decoding="async" />
                        </div>
                        <div className="search-result-info">
                          <p className="search-result-name">{p.name}</p>
                          <p className="search-result-price">{formatRupiah(p.price)}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                  <a
                    href={`/products?q=${encodeURIComponent(searchQuery.trim())}`}
                    className="search-see-all"
                    onClick={() => setSearchOpen(false)}
                  >
                    Lihat semua hasil untuk "{searchQuery}"
                  </a>
                </>
              ) : (
                <>
                  <p className="search-popular-label">Pencarian Populer</p>
                  <div className="search-popular-tags">
                    {popularTags.map(tag => (
                      <button key={tag} className="search-tag" onClick={() => setSearchQuery(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Nav drawer */}
      {(navOpen || cartOpen) && (
        <div className="drawer-backdrop" onClick={closeAll} aria-hidden="true" />
      )}

      <div className={`nav-drawer${navOpen ? " open" : ""}`} aria-hidden={!navOpen}>
        <div className="drawer-head">
          <a href="/" className="drawer-logo" onClick={() => setNavOpen(false)}>PAPAPOW</a>
          <button aria-label="Tutup menu" className="icon-btn" onClick={() => setNavOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="drawer-nav">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className={`drawer-link${link.highlight ? " highlight" : ""}`}
              onClick={() => setNavOpen(false)}
            >
              <span className="drawer-link-num">0{i + 1}</span>
              <span className="drawer-link-label">{link.label}</span>
              <svg className="drawer-link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          ))}
        </nav>

        <div className="drawer-footer">
          <button
            className="drawer-search-btn"
            onClick={() => { closeAll(); setSearchOpen(true); }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Cari Produk
          </button>
          <p className="drawer-tagline">Monochrome goods for daily motion.</p>
        </div>
      </div>

      {/* Cart drawer */}
      <div className={`cart-drawer${cartOpen ? " open" : ""}`} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <span className="drawer-title">Keranjang Saya</span>
          <button aria-label="Tutup keranjang" className="icon-btn" onClick={() => setCartOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-title">Keranjang Kosong</p>
            <p className="cart-empty-sub">
              {user
                ? `Halo, ${user.name}. Belum ada produk di keranjang.`
                : "Tambah produk atau masuk untuk melanjutkan belanja"}
            </p>
            <div className="cart-cta-row">
              <a href="#catalog" className="cart-cta-secondary" onClick={() => setCartOpen(false)}>
                Lanjutkan berbelanja
              </a>
              {user ? (
                <a href="/account" className="cart-cta-primary">Akun Saya</a>
              ) : (
                <a href="/account" className="cart-cta-primary">Login</a>
              )}
            </div>
          </div>
        ) : (
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="cart-item">
                <div className="cart-item-img">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                </div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  {item.size && <p className="cart-item-size">Ukuran: {item.size}</p>}
                  <p className="cart-item-price">{formatRupiah(item.price)}</p>
                  <div className="cart-item-qty-row">
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                      aria-label="Kurangi"
                    >−</button>
                    <span className="cart-qty-val">{item.qty}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                      aria-label="Tambah"
                    >+</button>
                  </div>
                </div>
                <button
                  type="button"
                  className="cart-item-remove"
                  onClick={() => { removeFromCart(item.productId, item.size); showToast("Produk dihapus dari keranjang", "info"); }}
                  aria-label="Hapus"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Total</span>
                <strong>{formatRupiah(cartTotal)}</strong>
              </div>
              <a href="/account" className="cart-cta-primary cart-checkout-btn" onClick={() => setCartOpen(false)}>
                {user ? "Checkout" : "Login untuk Checkout"}
              </a>
            </div>
          </div>
        )}

        {cartItems.length === 0 && products.length > 0 && (
          <div className="cart-suggestions">
            <p className="cart-suggestions-label">Produk Pilihan</p>
            <div className="cart-suggestions-grid">
              {products.slice(0, 4).map(p => (
                <a
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="cart-suggestion-card"
                  onClick={() => setCartOpen(false)}
                >
                  <div className="cart-suggestion-img">
                    <img src={p.main_image} alt={p.name} loading="lazy" decoding="async" />
                  </div>
                  <p className="cart-suggestion-name">{p.name}</p>
                  <div className="cart-suggestion-price">
                    {p.compare_at_price && (
                      <span className="cart-suggestion-compare">{formatRupiah(p.compare_at_price)}</span>
                    )}
                    <span>{formatRupiah(p.price)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
