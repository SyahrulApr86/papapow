import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <main style={{ display: "flex", flexDirection: "column", minHeight: "100svh" }}>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        gap: 24,
      }}>
        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".2em",
          color: "var(--muted)",
          textTransform: "uppercase",
          margin: 0,
        }}>404</p>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(32px, 6vw, 56px)",
          fontStyle: "italic",
          fontWeight: 400,
          margin: 0,
          lineHeight: 1.1,
        }}>Halaman tidak ditemukan.</h1>
        <p style={{ color: "var(--muted)", fontSize: 16, margin: 0, maxWidth: 400 }}>
          Produk atau halaman yang kamu cari mungkin sudah tidak tersedia.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/" style={{
            background: "var(--ink)",
            color: "#fff",
            border: "2px solid var(--ink)",
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}>Ke Beranda</a>
          <a href="/products" style={{
            background: "transparent",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}>Lihat Produk</a>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
