import { Suspense } from "react";
import { getBanners, getProducts } from "@/lib/catalog";
import { isAdmin } from "@/lib/admin-auth";
import { AdminToast } from "@/components/admin-toast";
import { AdminScrollPreserver } from "@/components/admin-scroll-preserver";
import { AdminProductForm } from "@/components/admin-product-form";
import {
  createProduct,
  deleteProduct,
  loginAction,
  logoutAction,
  updateBanner,
  updateProduct,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ error?: string; updated?: string }>;
};

function LoginField({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input name={name} type={type} required />
    </label>
  );
}

function BannerField({ label, name, defaultValue, type = "text" }: {
  label: string; name: string; defaultValue?: string | number | null; type?: string;
}) {
  if (type === "file") return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input name={name} type="file" accept="image/*" />
    </label>
  );
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [{ error }, allowed] = await Promise.all([searchParams, isAdmin()]);

  if (!allowed) {
    return (
      <main className="admin-shell login-shell">
        <form className="login-panel" action={loginAction}>
          <a className="brand-mark" href="/">
            <img src="/images/logo-white.jpg" alt="PAPAPOW" className="brand-logo-img" />
          </a>
          <h1>Admin Panel</h1>
          <p>Masuk untuk kelola produk dan banner katalog.</p>
          {error ? <strong className="form-error">Password salah.</strong> : null}
          <LoginField label="Password" name="password" type="password" />
          <button className="admin-button" type="submit">Masuk</button>
        </form>
      </main>
    );
  }

  const [products, banners] = await Promise.all([getProducts(), getBanners()]);

  return (
    <main className="admin-shell">
      <Suspense><AdminToast /></Suspense>
      <AdminScrollPreserver />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <a className="brand-mark" href="/">
            <img src="/images/logo-white.jpg" alt="PAPAPOW" className="brand-logo-img" />
          </a>
        </div>
        <nav className="admin-sidebar-nav">
          <p className="admin-nav-label">Konten</p>
          <a className="admin-nav-link" href="#products">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            Semua Produk
            <span style={{marginLeft:'auto',background:'rgba(255,255,255,.15)',borderRadius:999,fontSize:11,fontWeight:700,padding:'2px 8px'}}>{products.length}</span>
          </a>
          <a className="admin-nav-link" href="#add-product">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Tambah Produk
          </a>
          <a className="admin-nav-link" href="#banners">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
            Banner
          </a>
        </nav>
        <div className="admin-sidebar-footer">
          <form action={logoutAction}>
            <button className="admin-button secondary" type="submit" style={{width:'100%'}}>
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-topbar-title">Catalog Admin</h1>
          {error ? <strong className="form-error">{error}</strong> : null}
        </div>

        <div className="admin-content">

        {/* ── Tambah Produk ── */}
        <section id="add-product" style={{marginBottom:48}}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Tambah Produk</h2>
          </div>
          <div className="admin-card">
            <div className="admin-card-body">
              <AdminProductForm action={createProduct} submitLabel="Simpan Produk" />
            </div>
          </div>
        </section>

        {/* ── Banner ── */}
        <section id="banners" style={{marginBottom:48}}>
          <div className="admin-section-header">
            <h2 className="admin-section-title">Banner</h2>
          </div>
          <div className="admin-list">
            {banners.map((banner) => (
              <div className="admin-card" key={banner.id}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title" style={{textTransform:'capitalize'}}>{banner.placement}</h3>
                </div>
                <div className="admin-card-body">
                  <form className="admin-form" action={updateBanner}>
                    <input name="id" type="hidden" value={banner.id} />
                    <input name="sort_order" type="hidden" value={banner.sort_order} />
                    <img className="admin-banner-thumb" src={banner.image_url} alt="" />
                    <BannerField label="Judul" name="title" defaultValue={banner.title} />
                    <BannerField label="Subtitle" name="subtitle" defaultValue={banner.subtitle} />
                    <BannerField label="Upload Gambar Banner" name="image_file" type="file" />
                    <BannerField label="CTA Label" name="cta_label" defaultValue={banner.cta_label} />
                    <BannerField label="CTA Link" name="cta_href" defaultValue={banner.cta_href} />
                    <button className="admin-button" type="submit">Update Banner</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Produk ── */}
        <section id="products">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Semua Produk</h2>
            <span style={{color:'var(--muted)',fontSize:13}}>{products.length} produk</span>
          </div>
          <div className="admin-list">
            {products.map((product) => (
              <div className="admin-card" key={product.id}>
                <div className="admin-card-header">
                  <h3 className="admin-card-title">{product.name}</h3>
                  <span style={{
                    background: product.is_featured ? '#dcfce7' : 'var(--soft)',
                    borderRadius: 999,
                    color: product.is_featured ? '#166534' : 'var(--muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                  }}>
                    {product.is_featured ? 'Featured' : 'Hidden'}
                  </span>
                </div>
                <div className="admin-card-body">
                  <AdminProductForm
                    action={updateProduct}
                    deleteAction={deleteProduct}
                    productId={product.id}
                    submitLabel="Update Produk"
                    images={{
                      mainImage: product.main_image,
                      hoverImage: product.hover_image,
                      extraImages: product.extra_images,
                    }}
                    defaultValues={{
                      name: product.name,
                      category: product.category,
                      price: product.price,
                      compare_at_price: product.compare_at_price,
                      discount_label: product.discount_label,
                      description: product.description,
                      material: product.material,
                      weight: product.weight,
                      sort_order: product.sort_order,
                      is_featured: product.is_featured,
                      sizes: product.sizes,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        </div>{/* admin-content */}
      </div>{/* admin-main */}
    </main>
  );
}
