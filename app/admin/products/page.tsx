import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin-auth";
import { getProducts } from "@/lib/catalog";
import { AdminShell } from "@/components/admin-shell";
import { AdminToast } from "@/components/admin-toast";
import { AdminScrollPreserver } from "@/components/admin-scroll-preserver";
import { AdminProductForm } from "@/components/admin-product-form";
import { deleteProduct, updateProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const allowed = await isAdmin();
  if (!allowed) redirect("/admin");

  const products = await getProducts();

  return (
    <AdminShell
      active="/admin/products"
      title="Semua Produk"
      productCount={products.length}
    >
      <Suspense><AdminToast /></Suspense>
      <AdminScrollPreserver />

      {products.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--muted)" }}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Belum ada produk</p>
          <a href="/admin/products/new" className="admin-button" style={{ display: "inline-flex", marginTop: 16 }}>
            + Tambah Produk Pertama
          </a>
        </div>
      )}

      <div className="admin-list">
        {products.map((product) => (
          <div className="admin-card" key={product.id}>
            <div className="admin-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={product.main_image}
                  alt={product.name}
                  style={{
                    borderRadius: 6,
                    height: 44,
                    objectFit: "cover",
                    width: 44,
                    flexShrink: 0,
                    background: "var(--soft)",
                  }}
                />
                <div>
                  <p className="admin-card-title" style={{ margin: 0 }}>{product.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>{product.category}</p>
                </div>
              </div>
              <span style={{
                background: product.is_featured ? "#dcfce7" : "var(--soft)",
                borderRadius: 999,
                color: product.is_featured ? "#166534" : "var(--muted)",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
              }}>
                {product.is_featured ? "Featured" : "Hidden"}
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
    </AdminShell>
  );
}
