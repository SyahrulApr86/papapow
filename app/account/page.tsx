import { getUserSession } from "@/lib/user-auth";
import { registerAction, loginAction, logoutAction } from "./actions";
import { AuthSection } from "./auth-section";
import { OrderTabs } from "./order-tabs";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  const user = await getUserSession();
  const { error, tab } = await searchParams;

  return (
    <main className="account-page">
      <div className="account-shell">
        <h1 className="account-title">Akun Saya</h1>

        {!user ? (
          <AuthSection
            defaultTab={tab === "login" ? "login" : "register"}
            error={error}
            loginAction={loginAction}
            registerAction={registerAction}
          />
        ) : (
          <div className="account-logged-in">
            {/* Sidebar — user info */}
            <div className="account-welcome">
              <div className="account-welcome-info">
                <p className="account-welcome-name">Halo, {user.name}</p>
                <p className="account-welcome-email">{user.email}</p>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="logout-btn">Keluar</button>
              </form>
            </div>

            {/* Main — keranjang & wishlist */}
            <OrderTabs defaultTab={tab} />
          </div>
        )}
      </div>
    </main>
  );
}
