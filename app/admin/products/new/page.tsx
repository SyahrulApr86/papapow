import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin-shell";
import { AdminToast } from "@/components/admin-toast";
import { AdminScrollPreserver } from "@/components/admin-scroll-preserver";
import { AdminProductForm } from "@/components/admin-product-form";
import { createProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const allowed = await isAdmin();
  if (!allowed) redirect("/admin");

  return (
    <AdminShell active="/admin/products/new" title="Tambah Produk">
      <Suspense><AdminToast /></Suspense>
      <AdminScrollPreserver />
      <div className="admin-card">
        <div className="admin-card-body">
          <AdminProductForm action={createProduct} submitLabel="Simpan Produk" />
        </div>
      </div>
    </AdminShell>
  );
}
