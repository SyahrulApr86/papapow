"use client";

import { useEffect } from "react";

const KEY = "admin_scroll_y";

export function AdminScrollPreserver() {
  useEffect(() => {
    // Restore on mount
    const saved = sessionStorage.getItem(KEY);
    if (saved !== null) {
      window.scrollTo({ top: Number(saved), behavior: "instant" });
      sessionStorage.removeItem(KEY);
    }

    // Save before any form submit
    const handleSubmit = () => {
      sessionStorage.setItem(KEY, String(window.scrollY));
    };

    document.addEventListener("submit", handleSubmit);
    return () => document.removeEventListener("submit", handleSubmit);
  }, []);

  return null;
}
