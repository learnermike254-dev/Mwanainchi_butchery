import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number; // KES
  quantity: number;
  weightKg?: number; // for meat items
  note?: string;
};

const KEY = "mwn_cart_v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("mwn:cart"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener("mwn:cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mwn:cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((item: Omit<CartItem, "id">) => {
    const items = read();
    const id = `${item.productId}-${item.weightKg ?? "x"}-${Date.now()}`;
    items.push({ ...item, id });
    write(items);
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, q: number) => {
    write(
      read().map((i) => (i.id === id ? { ...i, quantity: Math.max(1, q) } : i)),
    );
  }, []);

  const clear = useCallback(() => write([]), []);

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, add, remove, setQty, clear, subtotal, count };
}

// Weight-based price with packaging premium for partials
export const PACKAGING_KES = 50;
export function calcMeatPrice(pricePerKg: number, weightKg: number) {
  const base = Math.round(pricePerKg * weightKg);
  return weightKg < 1 ? base + PACKAGING_KES : base;
}

export const WEIGHT_OPTIONS: number[] = [0.25, 0.5, 0.75, 1];
