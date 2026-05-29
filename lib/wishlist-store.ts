export type WishlistItem = {
  productId: number;
  name: string;
  image: string;
  price: number;
  compare_at_price: number | null;
};

const KEY = "papapow_wishlist";
export const WISHLIST_EVENT = "papapow:wishlist";

function read(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_EVENT));
}

export function getWishlist(): WishlistItem[] {
  return read();
}

export function isWishlisted(productId: number): boolean {
  return read().some((i) => i.productId === productId);
}

export function toggleWishlist(item: WishlistItem): boolean {
  const items = read();
  const idx = items.findIndex((i) => i.productId === item.productId);
  if (idx >= 0) {
    items.splice(idx, 1);
    write(items);
    return false; // removed
  } else {
    items.push(item);
    write(items);
    return true; // added
  }
}

export function removeFromWishlist(productId: number) {
  write(read().filter((i) => i.productId !== productId));
}
