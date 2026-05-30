"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F8F7F4" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100svh",
          padding: "80px 24px",
          textAlign: "center",
          gap: 24,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".2em", color: "#737373", textTransform: "uppercase", margin: 0 }}>
            Server Error
          </p>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, fontStyle: "italic", margin: 0, lineHeight: 1.1 }}>
            Ada yang salah.
          </h1>
          <p style={{ color: "#737373", fontSize: 16, margin: 0, maxWidth: 400 }}>
            Terjadi kesalahan server. Tim kami sedang bekerja untuk memperbaikinya.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#111",
              color: "#fff",
              border: "2px solid #111",
              padding: "12px 28px",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
