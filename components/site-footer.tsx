import { getSetting } from "@/lib/settings";
import { WAButton } from "./wa-button";

export async function SiteFooter() {
  const year = new Date().getFullYear();
  const date = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const waNumber = await getSetting("wa_number", "6281234567890");

  return (
    <>
      <WAButton waNumber={waNumber} />
      <footer className="site-footer">
        {/* Edition bar — newspaper header treatment */}
        <div className="footer-edition-bar">
          <span className="footer-edition-brand">PAPAPOW</span>
          <span className="footer-edition-meta">{date}</span>
          <span className="footer-edition-vol">Est. 2017 · Jakarta, Indonesia</span>
        </div>

        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/images/logo-black.png" alt="PAPAPOW" className="footer-logo" />
            <p className="footer-tagline">Monochrome goods for daily motion.</p>
            <p className="footer-est">Vol. I · Monochrome · Motion</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-title">Shop</p>
              <a href="/products">All Products</a>
              <a href="/products">Catalog</a>
              <a href="/products">Sale</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Account</p>
              <a href="/account">Login / Register</a>
              <a href="/account?tab=wishlist">Wishlist</a>
              <a href="/account?tab=keranjang">Keranjang</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} PAPAPOW. All rights reserved.</p>
          <p className="footer-note">Printed in Jakarta · Monochrome Goods for Daily Motion</p>
        </div>
      </footer>
    </>
  );
}
