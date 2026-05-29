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
      {error ? <strong className="form-error" style={{display:'block',marginBottom:16}}>{error}</strong> : null}
      <header className="admin-header">
        <div>
          <a className="brand-mark" href="/">
            <img src="/images/logo-white.jpg" alt="PAPAPOW" className="brand-logo-img" />
          </a>
          <h1>Catalog Admin</h1>
        </div>
        <form action={logoutAction}>
          <button className="admin-button secondary" type="submit">
            Keluar
          </button>
        </form>
      </header>

      <section className="admin-section">
        <h2>Tambah Produk</h2>
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
      </section>

      <section className="admin-section">
        <h2>Banner</h2>
        <div className="admin-list">
          {banners.map((banner) => (
            <form className="admin-form" action={updateBanner} key={banner.id}>
              <input name="id" type="hidden" value={banner.id} />
              <p className="eyebrow">{banner.placement}</p>
              <img className="admin-banner-thumb" src={banner.image_url} alt="" />
              <Field label="Judul" name="title" defaultValue={banner.title} required />
              <Field label="Subtitle" name="subtitle" defaultValue={banner.subtitle} />
              <Field label="Upload Gambar Banner" name="image_file" type="file" />
              <Field label="CTA Label" name="cta_label" defaultValue={banner.cta_label} />
              <Field label="CTA Link" name="cta_href" defaultValue={banner.cta_href} />
              <Field
                label="Urutan"
                name="sort_order"
                type="number"
                defaultValue={banner.sort_order}
              />
              <button className="admin-button" type="submit">
                Update Banner
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Produk</h2>
        <div className="admin-list">
          {products.map((product) => (
            <form className="admin-form product-form" action={updateProduct} key={product.id}>
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
              <Field
                label="Harga Coret"
                name="compare_at_price"
                type="number"
                defaultValue={product.compare_at_price}
              />
              <Field label="Diskon" name="discount_label" defaultValue={product.discount_label} />
              <Field label="Ganti Gambar Utama" name="main_image_file" type="file" />
              <Field label="Ganti Gambar Hover" name="hover_image_file" type="file" />
              <Field label="Ganti Gambar Tambahan (bisa banyak)" name="extra_images_file" type="file" multiple />
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
                <button className="admin-button" type="submit">
                  Update
                </button>
                <button
                  className="admin-button danger"
                  formAction={deleteProduct}
                  type="submit"
                >
                  Hapus
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
