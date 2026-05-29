"use client";

import { useRef, useState } from "react";
import { AdminSizePicker } from "./admin-size-picker";

/* ── Image upload box with preview ────────────────────── */

function ImageBox({
  name,
  label,
  required,
  multiple,
  existing,
}: {
  name: string;
  label: string;
  required?: boolean;
  multiple?: boolean;
  existing?: string | string[] | null;
}) {
  const initials = Array.isArray(existing)
    ? existing.filter(Boolean)
    : existing
    ? [existing]
    : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>(initials);
  const hasImage = previews.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setPreviews([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="img-upload-box">
      <p className="img-upload-label">
        {label}
        {required && <span className="img-upload-req">*</span>}
      </p>
      <button
        type="button"
        className={`img-upload-zone${hasImage ? " has-image" : ""}${multiple ? " multi-zone" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        {hasImage ? (
          multiple && previews.length > 1 ? (
            <div className="img-upload-multi-grid">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="img-upload-preview-img" />
              ))}
            </div>
          ) : (
            <img src={previews[0]} alt="" className="img-upload-preview-img" />
          )
        ) : (
          <div className="img-upload-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>{multiple ? "Pilih beberapa gambar" : "Pilih gambar"}</span>
            <span className="img-upload-hint">Klik untuk upload</span>
          </div>
        )}
        {hasImage && (
          <div className="img-upload-overlay">
            <span>Ganti gambar</span>
          </div>
        )}
      </button>
      {hasImage && (
        <button
          type="button"
          className="img-upload-clear"
          onClick={handleClear}
        >
          ✕ Hapus
        </button>
      )}
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        required={required && !hasImage}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

/* ── Field ──────────────────────────────────────────────── */

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  if (type === "textarea") {
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          required={required}
          rows={3}
          placeholder={placeholder}
        />
      </label>
    );
  }
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

/* ── Section wrapper ────────────────────────────────────── */

function FormSection({
  title,
  children,
  cols,
}: {
  title: string;
  children: React.ReactNode;
  cols?: number;
}) {
  return (
    <div className="apf-section">
      <p className="apf-section-title">{title}</p>
      <div
        className="apf-section-body"
        style={cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Product: existing image props ─────────────────────── */

type ImageProps = {
  mainImage?: string;
  hoverImage?: string | null;
  extraImages?: string[];
};

/* ── Main form component ────────────────────────────────── */

export function AdminProductForm({
  action,
  productId,
  defaultValues,
  images,
  submitLabel = "Simpan Produk",
  deleteAction,
}: {
  action: (formData: FormData) => Promise<void>;
  productId?: number;
  defaultValues?: {
    name?: string;
    category?: string;
    price?: number | null;
    compare_at_price?: number | null;
    discount_label?: string | null;
    description?: string | null;
    material?: string | null;
    weight?: number | null;
    sort_order?: number;
    is_featured?: boolean;
    sizes?: string[];
  };
  images?: ImageProps;
  submitLabel?: string;
  deleteAction?: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="apf-form">
      {productId && <input name="id" type="hidden" value={productId} />}

      {/* ── Gambar ── */}
      <FormSection title="Gambar Produk">
        <ImageBox
          name="main_image_file"
          label="Gambar Utama"
          required={!images?.mainImage}
          existing={images?.mainImage}
        />
        <ImageBox
          name="hover_image_file"
          label="Gambar Hover"
          existing={images?.hoverImage}
        />
        <ImageBox
          name="extra_images_file"
          label="Galeri Tambahan"
          multiple
          existing={images?.extraImages ?? []}
        />
      </FormSection>

      {/* ── Info dasar ── */}
      <FormSection title="Informasi Produk" cols={2}>
        <Field
          label="Nama Produk"
          name="name"
          defaultValue={defaultValues?.name}
          required
          placeholder="mis. Heavy Hoodie - Night"
        />
        <Field
          label="Kategori"
          name="category"
          defaultValue={defaultValues?.category}
          required
          placeholder="mis. Outerwear"
        />
      </FormSection>

      {/* ── Harga ── */}
      <FormSection title="Harga" cols={3}>
        <Field
          label="Harga (Rp)"
          name="price"
          type="number"
          defaultValue={defaultValues?.price}
          required
          placeholder="419000"
        />
        <Field
          label="Harga Coret (Rp)"
          name="compare_at_price"
          type="number"
          defaultValue={defaultValues?.compare_at_price}
          placeholder="499000"
        />
        <Field
          label="Label Diskon"
          name="discount_label"
          defaultValue={defaultValues?.discount_label}
          placeholder="mis. 16%"
        />
      </FormSection>

      {/* ── Ukuran ── */}
      <FormSection title="Ukuran">
        <AdminSizePicker
          defaultValue={defaultValues?.sizes?.join(",")}
        />
      </FormSection>

      {/* ── Detail ── */}
      <FormSection title="Detail Produk" cols={2}>
        <Field
          label="Deskripsi"
          name="description"
          type="textarea"
          defaultValue={defaultValues?.description}
          placeholder="Ceritakan tentang produk ini..."
        />
        <Field
          label="Material"
          name="material"
          type="textarea"
          defaultValue={defaultValues?.material}
          placeholder="mis. 100% Cotton Fleece 380gsm"
        />
      </FormSection>

      {/* ── Pengaturan ── */}
      <FormSection title="Pengaturan" cols={2}>
        <Field
          label="Berat (gram)"
          name="weight"
          type="number"
          defaultValue={defaultValues?.weight}
          placeholder="500"
        />
        <Field
          label="Urutan Tampil"
          name="sort_order"
          type="number"
          defaultValue={defaultValues?.sort_order ?? 0}
        />
      </FormSection>

      <div className="apf-footer">
        <label className="check-field">
          <input
            name="is_featured"
            type="checkbox"
            defaultChecked={defaultValues?.is_featured ?? true}
          />
          <span>Tampil di homepage</span>
        </label>
        <div className="apf-actions">
          {deleteAction && (
            <button
              type="submit"
              formAction={deleteAction}
              className="admin-button danger"
            >
              Hapus Produk
            </button>
          )}
          <button type="submit" className="admin-button">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
