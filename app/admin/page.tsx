import { Suspense } from "react";
import { getBanners, getProducts } from "@/lib/catalog";
import { isAdmin } from "@/lib/admin-auth";
import { PapapowLogo } from "@/components/papapow-logo";
import { AdminSizePicker } from "@/components/admin-size-picker";
import { AdminToast } from "@/components/admin-toast";
import { AdminScrollPreserver } from "@/components/admin-scroll-preserver";
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
  searchParams: Promise<{ error?: string }>;
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
        <input name={name} type="file" required={required} multiple={multiple} />
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
            <PapapowLogo compact />
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
      <header className="admin-header">
        <div>
          <a className="brand-mark" href="/">
            <PapapowLogo compact />
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
        <form className="admin-form product-form" action={createProduct} encType="multipart/form-data">
          <Field label="Nama" name="name" required />
          <Field label="Kategori" name="category" required />
          <Field label="Harga" name="price" type="number" required />
          <Field label="Harga Coret" name="compare_at_price" type="number" />
          <Field label="Diskon" name="discount_label" />
          <Field label="Upload Gambar Utama" name="image_file" type="file" required />
          <Field label="— atau URL Gambar" name="image_url" />
          <Field label="Upload Gambar Tambahan" name="images_file" type="file" multiple />
          <Field label="— atau URL Gambar Tambahan (JSON)" name="images" />
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
              <Field label="Judul" name="title" defaultValue={banner.title} required />
              <Field label="Subtitle" name="subtitle" defaultValue={banner.subtitle} />
              <Field
                label="Gambar URL"
                name="image_url"
                defaultValue={banner.image_url}
                required
              />
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
            <form className="admin-form product-form" action={updateProduct} key={product.id} encType="multipart/form-data">
              <input name="id" type="hidden" value={product.id} />
              <img className="admin-thumb" src={product.image_url} alt="" />
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
              <Field label="Upload Gambar Baru" name="image_file" type="file" />
              <Field label="— atau Gambar saat ini (URL)" name="image_url" defaultValue={product.image_url} />
              <Field label="Upload Gambar Tambahan" name="images_file" type="file" multiple />
              <Field label="— atau Gambar Tambahan (JSON)" name="images" defaultValue={JSON.stringify(product.images)} />
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
