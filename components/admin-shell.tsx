import { logoutAction } from "@/app/admin/actions";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  {
    href: "/admin/products",
    label: "Semua Produk",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    href: "/admin/products/new",
    label: "Tambah Produk",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    href: "/admin/banners",
    label: "Banner",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export function AdminShell({
  children,
  active,
  title,
  productCount,
}: {
  children: React.ReactNode;
  active: string;
  title: string;
  productCount?: number;
}) {
  return (
    <main className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <a className="brand-mark" href="/">
            <img src="/images/logo-black.png" alt="PAPAPOW" className="brand-logo-img" />
          </a>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="admin-nav-label">Katalog</p>
          {NAV.map((item) => (
            <a
              key={item.href}
              className={`admin-nav-link${active === item.href ? " active" : ""}`}
              href={item.href}
            >
              {item.icon}
              {item.label}
              {item.href === "/admin/products" && productCount !== undefined && (
                <span style={{
                  background: "rgba(255,255,255,.15)",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  marginLeft: "auto",
                  padding: "2px 8px",
                }}>
                  {productCount}
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a
            href="/"
            className="admin-nav-link"
            style={{ marginBottom: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Lihat Toko
          </a>
          <form action={logoutAction}>
            <button className="admin-button secondary" type="submit" style={{ width: "100%" }}>
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-topbar-title">{title}</h1>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </main>
  );
}
