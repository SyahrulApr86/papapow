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
        <a className="brand-mark" href="/">
          <img src="/images/logo-white.jpg" alt="PAPAPOW" className="brand-logo-img" />
        </a>
        <h1>Admin Panel</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "4px 0 0" }}>
          Masuk untuk kelola produk dan banner katalog.
        </p>
        {error && <strong className="form-error">Password salah.</strong>}
        <label className="field">
          <span className="field-label">Password</span>
          <input name="password" type="password" required autoFocus />
        </label>
        <button className="admin-button" type="submit" style={{ marginTop: 4 }}>
          Masuk
        </button>
      </form>
    </main>
  );
}
