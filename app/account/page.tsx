import { getUserSession } from "@/lib/user-auth";
import { registerAction, loginAction, logoutAction } from "./actions";
import { AccountTabs } from "./account-tabs";
import { OrderTabs } from "./order-tabs";

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

            {error && <p className="auth-error auth-error-center">{decodeURIComponent(error)}</p>}

            {/* Auth forms */}
            <div className="auth-container" id="auth-forms">
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

            <OrderTabs defaultTab={tab} />
          </>
        )}
      </div>
    </main>
  );
}
