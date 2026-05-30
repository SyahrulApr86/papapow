"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/format";
import { getWishlist, removeFromWishlist, WISHLIST_EVENT, type WishlistItem } from "@/lib/wishlist-store";
import { getCart, removeFromCart, updateQty, CART_EVENT, type CartItem } from "@/lib/cart-store";
import { showToast } from "@/lib/toast-store";

export function OrderTabs({ defaultTab = "keranjang" }: { defaultTab?: string }) {
  const [active, setActive] = useState<"keranjang" | "wishlist">(
    defaultTab === "wishlist" ? "wishlist" : "keranjang",
  );
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setWishlist(getWishlist());
    setCart(getCart());
    const syncW = () => setWishlist(getWishlist());
    const syncC = () => setCart(getCart());
    window.addEventListener(WISHLIST_EVENT, syncW);
    window.addEventListener(CART_EVENT, syncC);
    window.addEventListener("storage", syncW);
    window.addEventListener("storage", syncC);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, syncW);
      window.removeEventListener(CART_EVENT, syncC);
      window.removeEventListener("storage", syncW);
      window.removeEventListener("storage", syncC);
    };
  }, []);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="account-orders-card">
      <div className="account-tab-bar">
        <button
          className={`account-tab${active === "keranjang" ? " active" : ""}`}
          onClick={() => setActive("keranjang")}
          type="button"
        >
          Keranjang {cart.length > 0 && `(${cart.reduce((s, i) => s + i.qty, 0)})`}
        </button>
        <button
          className={`account-tab${active === "wishlist" ? " active" : ""}`}
          onClick={() => setActive("wishlist")}
          type="button"
        >
          Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
        </button>
      </div>

      {/* ── Keranjang ── */}
      {active === "keranjang" && (
        cart.length === 0 ? (
          <div className="account-empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p className="empty-state-title">Keranjang kosong</p>
            <p className="empty-state-sub">Tambah produk ke keranjang untuk melanjutkan.</p>
            <a href="/products" className="empty-state-cta">Belanja Sekarang</a>
          </div>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="wishlist-card">
                <a href={`/products/${item.productId}`} className="wishlist-card-img">
                  <img src={item.image} alt={item.name} />
                </a>
                <div className="wishlist-card-info">
                  <a href={`/products/${item.productId}`} className="wishlist-card-name">{item.name}</a>
                  {item.size && <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>Ukuran: {item.size}</p>}
                  <p style={{ fontWeight: 700, fontSize: 13, margin: "4px 0 0" }}>{formatRupiah(item.price)}</p>
                  <div className="cart-item-qty-row" style={{ marginTop: 6 }}>
                    <button type="button" className="cart-qty-btn" onClick={() => updateQty(item.productId, item.size, item.qty - 1)}>−</button>
                    <span className="cart-qty-val">{item.qty}</span>
                    <button type="button" className="cart-qty-btn" onClick={() => updateQty(item.productId, item.size, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button
                  type="button"
                  className="wishlist-card-remove"
                  onClick={() => { removeFromCart(item.productId, item.size); showToast("Produk dihapus dari keranjang", "info"); }}
                  aria-label="Hapus"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <div style={{ padding: "16px 20px", borderTop: "2px solid var(--ink)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14 }}>Total</span>
              <strong style={{ fontSize: 16 }}>{formatRupiah(cartTotal)}</strong>
            </div>
          </div>
        )
      )}

      {/* ── Wishlist ── */}
      {active === "wishlist" && (
        wishlist.length === 0 ? (
          <div className="account-empty-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p className="empty-state-title">Wishlist kosong</p>
            <p className="empty-state-sub">Simpan produk favorit kamu untuk dibeli nanti.</p>
            <a href="/products" className="empty-state-cta">Jelajahi Produk</a>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.productId} className="wishlist-card">
                <a href={`/products/${item.productId}`} className="wishlist-card-img">
                  <img src={item.image} alt={item.name} />
                </a>
                <div className="wishlist-card-info">
                  <a href={`/products/${item.productId}`} className="wishlist-card-name">{item.name}</a>
                  <div className="wishlist-card-price">
                    {item.compare_at_price && (
                      <span className="compare-price">{formatRupiah(item.compare_at_price)}</span>
                    )}
                    <strong>{formatRupiah(item.price)}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="wishlist-card-remove"
                  onClick={() => { removeFromWishlist(item.productId); showToast("Dihapus dari wishlist", "info"); }}
                  aria-label="Hapus dari wishlist"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
