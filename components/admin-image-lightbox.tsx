"use client";

import { useState } from "react";

export function AdminImageLightbox({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        className="admin-thumb"
        src={src}
        alt={alt ?? ""}
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(true)}
      />
      {open ? (
        <div className="lightbox-overlay" onClick={() => setOpen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={src} alt={alt ?? ""} />
            <button className="lightbox-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
