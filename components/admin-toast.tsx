"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const processedRef = useRef<string | null>(null);

  // Capture message once per unique updated param, then clear URL
  useEffect(() => {
    const updated = searchParams.get("updated");
    if (!updated || processedRef.current === updated) return;
    processedRef.current = updated;
    setMessage(decodeURIComponent(updated));
    setVisible(true);
    router.replace(pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  // Independent dismiss timer — not tied to searchParams changes
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!message) return null;

  return (
    <div className={`admin-toast${visible ? " show" : ""}`} role="status">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      {message}
    </div>
  );
}
