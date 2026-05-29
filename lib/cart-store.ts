// Cart stored in localStorage as JSON array of CartItem

export type CartItem = {
  productId: number;
  name: string;
  image: string;
  size: string;
  price: number;
  qty: number;
};

const KEY = "papapow_cart";
const EVENT = "papapow:cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(item: Omit<CartItem, "qty"> & { qty?: number }) {
  const items = read();
  const idx = items.findIndex(
    (i) => i.productId === item.productId && i.size === item.size,
  );
  if (idx >= 0) {
    items[idx].qty += item.qty ?? 1;
  } else {
    items.push({ ...item, qty: item.qty ?? 1 });
  }
  write(items);
}

export function removeFromCart(productId: number, size: string) {
  write(read().filter((i) => !(i.productId === productId && i.size === size)));
}

export function updateQty(productId: number, size: string, qty: number) {
  if (qty < 1) { removeFromCart(productId, size); return; }
  const items = read();
  const idx = items.findIndex(
    (i) => i.productId === productId && i.size === size,
  );
  if (idx >= 0) { items[idx].qty = qty; write(items); }
}

export function clearCart() {
  write([]);
}

export const CART_EVENT = EVENT;
