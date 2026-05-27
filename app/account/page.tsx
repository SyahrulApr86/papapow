import { getUserSession } from "@/lib/user-auth";
import { registerAction, loginAction, logoutAction } from "./actions";
import { AccountTabs } from "./account-tabs";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  const user = await getUserSession();
  const { error, tab } = await searchParams;

  return (
    <main className="account-page">
      <div className="account-shell">
        <h1 className="account-title">Akun Saya</h1>

        {!user ? (
          <>
            {/* Auth promo banner */}
            <div className="auth-banner">
              <div className="auth-banner-text">
                <strong>Nikmati Diskon Spesial dan Pantau Pesanan Kamu</strong>
                <p>
                  Dapatkan diskon eksklusif sambil melacak pesanan dan percakapan kamu dengan mudah.
                  Tetap terhubung dengan kami dan selalu tahu perkembangan pembelian kamu, semua
                  dalam satu platform.
                </p>
              </div>
              <div className="auth-banner-actions">
                <a href="#login" className="auth-btn-outline">Login</a>
                <a href="#register" className="auth-btn-fill">Daftar</a>
              </div>
            </div>

            {error && <p className="auth-error">{decodeURIComponent(error)}</p>}

            {/* Auth forms */}
            <div className="auth-forms" id="auth-forms">
              <AccountTabs defaultTab={tab === "login" ? "login" : "register"}>
                {/* Login form */}
                <form action={loginAction} className="auth-form" data-tab="login">
                  <label>
                    <span>Email</span>
                    <input type="email" name="email" placeholder="email@kamu.com" required />
                  </label>
                  <label>
                    <span>Password</span>
                    <input type="password" name="password" placeholder="••••••••" required />
                  </label>
                  <button type="submit" className="auth-submit">Masuk</button>
                  <p className="auth-hint">
                    Belum punya akun?{" "}
                    <a href="#register" className="auth-link">Daftar sekarang</a>
                  </p>
                </form>

                {/* Register form */}
                <form action={registerAction} className="auth-form" data-tab="register">
                  <label>
                    <span>Nama</span>
                    <input type="text" name="name" placeholder="Nama lengkap kamu" required />
                  </label>
                  <label>
                    <span>Email</span>
                    <input type="email" name="email" placeholder="email@kamu.com" required />
                  </label>
                  <label>
                    <span>Password</span>
                    <input type="password" name="password" placeholder="Min. 6 karakter" required minLength={6} />
                  </label>
                  <button type="submit" className="auth-submit">Buat Akun</button>
                  <p className="auth-hint">
                    Sudah punya akun?{" "}
                    <a href="#login" className="auth-link">Masuk</a>
                  </p>
                </form>
              </AccountTabs>
            </div>
          </>
        ) : (
          <>
            {/* Logged in state */}
            <div className="account-welcome">
              <div className="account-welcome-info">
                <p className="account-welcome-name">Halo, {user.name} 👋</p>
                <p className="account-welcome-email">{user.email}</p>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="logout-btn">Keluar</button>
              </form>
            </div>

            <div className="account-orders-card">
              <div className="account-tab-bar">
                <span className="account-tab active">Pesanan</span>
                <span className="account-tab">Wishlist</span>
              </div>
              <div className="account-empty-state">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <p className="empty-state-title">Tidak ada pesanan</p>
                <p className="empty-state-sub">Silakan buat pesanan untuk melihatnya disini.</p>
                <a href="/#catalog" className="empty-state-cta">Belanja Sekarang</a>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
