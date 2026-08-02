"use client";

import * as React from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  maxQty?: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalQty: number;
  totalPrice: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const STORAGE_KEY = "triade:carrinho";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage indisponível ou corrompido - segue com carrinho vazio
    } finally {
      setHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = React.useCallback(
    (item, qty = 1) => {
      setItems((current) => {
        const existing = current.find((i) => i.productId === item.productId);
        if (existing) {
          const nextQty = item.maxQty
            ? Math.min(existing.qty + qty, item.maxQty)
            : existing.qty + qty;
          return current.map((i) =>
            i.productId === item.productId ? { ...i, qty: nextQty } : i
          );
        }
        return [...current, { ...item, qty }];
      });
    },
    []
  );

  const removeItem = React.useCallback((productId: string) => {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }, []);

  const updateQty = React.useCallback((productId: string, qty: number) => {
    setItems((current) => {
      if (qty <= 0) return current.filter((i) => i.productId !== productId);
      return current.map((i) =>
        i.productId === productId
          ? { ...i, qty: i.maxQty ? Math.min(qty, i.maxQty) : qty }
          : i
      );
    });
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clear, totalQty, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
