import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdmin } from "@/lib/admin-auth";
import { getSetting } from "@/lib/settings";
import { AdminShell } from "@/components/admin-shell";
import { AdminToast } from "@/components/admin-toast";
import { updateSettings } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const allowed = await isAdmin();
  if (!allowed) redirect("/admin");

  const waNumber = await getSetting("wa_number", "6281234567890");

  return (
    <AdminShell active="/admin/settings" title="Pengaturan">
      <Suspense><AdminToast /></Suspense>

      <div className="admin-card" style={{ maxWidth: 520 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">Kontak & WhatsApp</h3>
        </div>
        <div className="admin-card-body">
          <form action={updateSettings} className="admin-form">
            <label className="field">
              <span className="field-label">Nomor WhatsApp</span>
              <input
                name="wa_number"
                type="text"
                defaultValue={waNumber}
                placeholder="6281234567890"
              />
            </label>
            <p style={{ color: "var(--muted)", fontSize: 12, margin: "-8px 0 0" }}>
              Format: kode negara + nomor tanpa tanda + atau spasi. Contoh: 6281234567890
            </p>
            <div>
              <button className="admin-button" type="submit">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
