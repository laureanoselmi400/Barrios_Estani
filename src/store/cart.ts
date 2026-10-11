"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  size: string;
  unitPrice: number; // precio efectivo al momento de agregar (solo informativo: el server recalcula)
  quantity: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: string, size: string, qty: number) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
};

const same = (a: CartItem, productId: string, size: string) =>
  a.productId === productId && a.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item, qty = 1) =>
        set((s) => {
          const exists = s.items.find((i) => same(i, item.productId, item.size));
          const items = exists
            ? s.items.map((i) =>
                same(i, item.productId, item.size)
                  ? { ...i, quantity: Math.min(10, i.quantity + qty) }
                  : i,
              )
            : [...s.items, { ...item, quantity: qty }];
          return { items, open: true };
        }),
      setQty: (productId, size, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (same(i, productId, size) ? { ...i, quantity: Math.min(10, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId, size) =>
        set((s) => ({ items: s.items.filter((i) => !same(i, productId, size)) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "barrio-street-cart",
      partialize: (s) => ({ items: s.items }), // el estado del drawer no se persiste
    },
  ),
);

export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
