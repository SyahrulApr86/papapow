"use client";

import { useState } from "react";
import type { Product } from "@/lib/db";
import { formatRupiah } from "@/lib/format";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "ALL PRODUCT", href: "#catalog" },
  { label: "CATALOG", href: "#catalog" },
  { label: "SALE", href: "#catalog", highlight: true },
];

const POPULAR_TAGS = ["tshirt", "polo", "hoodie", "pants", "longsleeve", "accessories", "oversize"];

export function SiteHeader({ products = [] }: { products?: Product[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          <a aria-label="Wishlist" href="/account?tab=wishlist" className="icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </a>
          <button aria-label="Cart" className="icon-btn" onClick={() => { closeAll(); setCartOpen(true); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
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
      {searchOpen && (
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
              onKeyDown={e => e.key === "Escape" && setSearchOpen(false)}
              className="search-overlay-input"
            />
            <button aria-label="Tutup pencarian" onClick={() => setSearchOpen(false)} className="search-overlay-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="search-overlay-body">
            <p className="search-popular-label">Pencarian Populer</p>
            <div className="search-popular-tags">
              {POPULAR_TAGS.map(tag => (
                <button key={tag} className="search-tag" onClick={() => { setSearchQuery(tag); }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
        <div className="cart-empty">
          <p className="cart-empty-title">Keranjang Kosong</p>
          <p className="cart-empty-sub">Tambah produk atau masuk untuk melanjutkan belanja</p>
          <div className="cart-cta-row">
            <a href="#catalog" className="cart-cta-secondary" onClick={() => setCartOpen(false)}>
              Lanjutkan berbelanja
            </a>
            <a href="/account" className="cart-cta-primary">
              Login
            </a>
          </div>
        </div>

        {products.length > 0 && (
          <div className="cart-suggestions">
            <p className="cart-suggestions-label">Baru Saja Dipesan</p>
            <div className="cart-suggestions-grid">
              {products.slice(0, 4).map(p => (
                <a
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="cart-suggestion-card"
                  onClick={() => setCartOpen(false)}
                >
                  <div className="cart-suggestion-img">
                    <img src={p.main_image} alt={p.name} />
                    <button
                      aria-label="Tambah ke keranjang"
                      className="cart-suggestion-add"
                      onClick={e => e.preventDefault()}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </button>
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
