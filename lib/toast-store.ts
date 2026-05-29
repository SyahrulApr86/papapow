export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export const TOAST_EVENT = "papapow:toast";

export function showToast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;
  const toast: Toast = { id: crypto.randomUUID(), message, type };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
}
