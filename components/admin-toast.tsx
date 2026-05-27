"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updated = searchParams.get("updated");
    if (!updated) return;

    setMessage(decodeURIComponent(updated));
    setVisible(true);

    // Clear the query param from URL without reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete("updated");
    const newUrl = params.size ? `${pathname}?${params}` : pathname;
    router.replace(newUrl, { scroll: false });

    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [searchParams, pathname, router]);

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
