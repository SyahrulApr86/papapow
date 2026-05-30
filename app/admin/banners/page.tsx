import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin-auth";
import { getBanners } from "@/lib/catalog";
import { AdminShell } from "@/components/admin-shell";
import { AdminToast } from "@/components/admin-toast";
import { AdminScrollPreserver } from "@/components/admin-scroll-preserver";
import { updateBanner } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function BannerField({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
}) {
  if (type === "file") {
    return (
      <label className="field">
        <span className="field-label">{label}</span>
        <input name={name} type="file" accept="image/*" />
      </label>
    );
  }
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

export default async function BannersPage() {
  const allowed = await isAdmin();
  if (!allowed) redirect("/admin");

  const banners = await getBanners();

  return (
    <AdminShell active="/admin/banners" title="Banner">
      <Suspense><AdminToast /></Suspense>
      <AdminScrollPreserver />

      <div className="admin-list">
        {banners.map((banner) => (
          <div className="admin-card" key={banner.id}>
            <div className="admin-card-header">
              <h3 className="admin-card-title" style={{ textTransform: "capitalize" }}>
                {banner.placement === "hero" ? "Hero (Utama)" : "Bottom Banner"}
              </h3>
            </div>
            <div className="admin-card-body">
              <form className="admin-form" action={updateBanner}>
                <input name="id" type="hidden" value={banner.id} />
                <input name="sort_order" type="hidden" value={banner.sort_order} />

                {/* Current image preview */}
                <div style={{ marginBottom: 16 }}>
                  <p className="field-label" style={{ marginBottom: 8 }}>Gambar Saat Ini</p>
                  <img
                    src={banner.image_url}
                    alt=""
                    style={{
                      borderRadius: 8,
                      display: "block",
                      height: "auto",
                      width: "100%",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <BannerField label="Judul" name="title" defaultValue={banner.title} />
                  <BannerField label="Subtitle" name="subtitle" defaultValue={banner.subtitle} />
                  <BannerField label="CTA Label" name="cta_label" defaultValue={banner.cta_label} />
                  <BannerField label="CTA Link" name="cta_href" defaultValue={banner.cta_href} />
                </div>

                <BannerField label="Ganti Gambar Banner" name="image_file" type="file" />

                <div>
                  <button className="admin-button" type="submit">Update Banner</button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
