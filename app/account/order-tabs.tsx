"use client";

import { useState } from "react";

export function OrderTabs({
  defaultTab = "pesanan",
}: {
  defaultTab?: string;
}) {
  const [active, setActive] = useState<"pesanan" | "wishlist">(
    defaultTab === "wishlist" ? "wishlist" : "pesanan",
  );

  return (
    <div className="account-orders-card">
      <div className="account-tab-bar">
        <button
          className={`account-tab${active === "pesanan" ? " active" : ""}`}
          onClick={() => setActive("pesanan")}
          type="button"
        >
          Pesanan
        </button>
        <button
          className={`account-tab${active === "wishlist" ? " active" : ""}`}
          onClick={() => setActive("wishlist")}
          type="button"
        >
          Wishlist
        </button>
      </div>
      <div className="account-empty-state">
        {active === "pesanan" ? (
          <>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p className="empty-state-title">Tidak ada pesanan</p>
            <p className="empty-state-sub">Silakan buat pesanan untuk melihatnya disini.</p>
            <a href="/#catalog" className="empty-state-cta">Belanja Sekarang</a>
          </>
        ) : (
          <>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p className="empty-state-title">Wishlist kosong</p>
            <p className="empty-state-sub">Simpan produk favorit kamu untuk dibeli nanti.</p>
            <a href="/#catalog" className="empty-state-cta">Jelajahi Produk</a>
          </>
        )}
      </div>
    </div>
  );
}
