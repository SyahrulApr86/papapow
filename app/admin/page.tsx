import { Suspense } from "react";
import { getBanners, getProducts } from "@/lib/catalog";
import { isAdmin } from "@/lib/admin-auth";
import { AdminSizePicker } from "@/components/admin-size-picker";
import { AdminToast } from "@/components/admin-toast";
import { AdminScrollPreserver } from "@/components/admin-scroll-preserver";
import { AdminImageLightbox } from "@/components/admin-image-lightbox";
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

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  multiple = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  multiple?: boolean;
}) {
  if (type === "textarea") {
    return (
      <label>
        <span>{label}</span>
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          required={required}
          rows={3}
        />
      </label>
    );
  }

  if (type === "file") {
    return (
      <label>
        <span>{label}</span>
        <input name={name} type="file" accept="image/*" required={required} multiple={multiple} />
      </label>
    );
  }

  return (
    <label>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
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
          <Field label="Password" name="password" type="password" required />
          <button className="admin-button" type="submit">
            Masuk
          </button>
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
        <form className="admin-form product-form" action={createProduct}>
          <Field label="Nama" name="name" required />
          <Field label="Kategori" name="category" required />
          <Field label="Harga" name="price" type="number" required />
          <Field label="Harga Coret" name="compare_at_price" type="number" />
          <Field label="Diskon" name="discount_label" />
          <Field label="Gambar Utama" name="main_image_file" type="file" required />
          <Field label="Gambar Hover (opsional)" name="hover_image_file" type="file" />
          <Field label="Gambar Tambahan (bisa banyak)" name="extra_images_file" type="file" multiple />
          <AdminSizePicker />
          <Field label="Deskripsi" name="description" type="textarea" />
          <Field label="Material" name="material" type="textarea" />
          <Field label="Berat (gram)" name="weight" type="number" />
          <Field label="Urutan" name="sort_order" type="number" defaultValue={0} />
          <label className="check-field">
            <input name="is_featured" type="checkbox" defaultChecked />
            <span>Tampil di homepage</span>
          </label>
          <button className="admin-button" type="submit">
            Simpan Produk
          </button>
        </form>
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
                    <img className="admin-banner-thumb" src={banner.image_url} alt="" />
                    <Field label="Judul" name="title" defaultValue={banner.title} required />
                    <Field label="Subtitle" name="subtitle" defaultValue={banner.subtitle} />
                    <Field label="Upload Gambar Banner" name="image_file" type="file" />
                    <Field label="CTA Label" name="cta_label" defaultValue={banner.cta_label} />
                    <Field label="CTA Link" name="cta_href" defaultValue={banner.cta_href} />
                    <Field label="Urutan" name="sort_order" type="number" defaultValue={banner.sort_order} />
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
                  <form className="admin-form product-form" action={updateProduct}>
                    <input name="id" type="hidden" value={product.id} />
                    <div className="admin-thumb-group">
                      <div className="admin-hover-wrap">
                        <AdminImageLightbox src={product.main_image} alt={`${product.name} utama`} />
                        <span>Utama</span>
                      </div>
                      {product.hover_image && (
                        <div className="admin-hover-wrap">
                          <AdminImageLightbox src={product.hover_image} alt={`${product.name} hover`} />
                          <span>Hover</span>
                        </div>
                      )}
                      {product.extra_images.map((url, i) => (
                        <div key={i} className="admin-hover-wrap">
                          <AdminImageLightbox src={url} alt={`${product.name} +${i + 1}`} />
                          <span>+{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <Field label="Nama" name="name" defaultValue={product.name} required />
                    <Field label="Kategori" name="category" defaultValue={product.category} required />
                    <Field label="Harga" name="price" type="number" defaultValue={product.price} required />
                    <Field label="Harga Coret" name="compare_at_price" type="number" defaultValue={product.compare_at_price} />
                    <Field label="Diskon" name="discount_label" defaultValue={product.discount_label} />
                    <Field label="Ganti Gambar Utama" name="main_image_file" type="file" />
                    <Field label="Ganti Gambar Hover" name="hover_image_file" type="file" />
                    <Field label="Ganti Gambar Tambahan" name="extra_images_file" type="file" multiple />
                    <AdminSizePicker defaultValue={product.sizes?.join(",")} />
                    <Field label="Deskripsi" name="description" type="textarea" defaultValue={product.description} />
                    <Field label="Material" name="material" type="textarea" defaultValue={product.material} />
                    <Field label="Berat (gram)" name="weight" type="number" defaultValue={product.weight} />
                    <Field label="Urutan" name="sort_order" type="number" defaultValue={product.sort_order} />
                    <label className="check-field">
                      <input name="is_featured" type="checkbox" defaultChecked={product.is_featured} />
                      <span>Tampil di homepage</span>
                    </label>
                    <div className="form-actions">
                      <button className="admin-button" type="submit">Update</button>
                      <button className="admin-button danger" formAction={deleteProduct} type="submit">Hapus</button>
                    </div>
                  </form>
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
