import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { loginAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [{ error }, allowed] = await Promise.all([searchParams, isAdmin()]);

  if (allowed) redirect("/admin/products");

  return (
    <main className="admin-shell login-shell">
      <form className="login-panel" action={loginAction}>
        <div className="login-panel-header">
          <a className="brand-mark" href="/">
            <img src="/images/logo-black.png" alt="PAPAPOW" className="brand-logo-img" />
          </a>
          <span className="login-panel-badge">Admin</span>
        </div>
        <div className="login-panel-body">
          <h1>Masuk ke Panel</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>
            Kelola produk dan banner katalog PAPAPOW.
          </p>
        </div>
        {error === "rate_limited" && (
          <strong className="form-error" style={{ fontSize: 13 }}>
            ✕ Terlalu banyak percobaan. Coba lagi dalam 15 menit.
          </strong>
        )}
        {error && error !== "rate_limited" && (
          <strong className="form-error" style={{ fontSize: 13 }}>✕ Password salah. Coba lagi.</strong>
        )}
        <label className="field">
          <span className="field-label">Password</span>
          <input name="password" type="password" required autoFocus placeholder="••••••••" />
        </label>
        <button className="admin-button login-submit-btn" type="submit">
          Masuk →
        </button>
      </form>
    </main>
  );
}
