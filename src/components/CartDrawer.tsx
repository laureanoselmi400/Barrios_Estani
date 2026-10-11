"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { selectCount, selectSubtotal, useCart } from "@/store/cart";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove } = useCart();
  const subtotal = useCart(selectSubtotal);
  const count = useCart(selectCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Cerrar con ESC y bloquear el scroll del fondo
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  if (!mounted || !open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setOpen(false)} />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-paper shadow-2xl">
        <header className="flex items-center justify-between border-b border-concrete-200 px-5 py-4">
          <h2 className="font-display text-lg font-extrabold uppercase tracking-wider">
            Tu carrito {count > 0 && <span className="text-concrete-400">({count})</span>}
          </h2>
          <button onClick={() => setOpen(false)} aria-label="Cerrar carrito" className="p-1">
            <X size={22} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag size={40} className="text-concrete-300" />
            <p className="text-sm text-concrete-500">Todavía no agregaste nada.</p>
            <Link href="/productos" onClick={() => setOpen(false)} className="btn-outline">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-concrete-200 overflow-y-auto px-5">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex gap-4 py-4">
                  <Link href={`/productos/${i.slug}`} onClick={() => setOpen(false)} className="h-24 w-20 shrink-0 bg-concrete-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image ?? "/placeholder.svg"} alt={i.title} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{i.title}</p>
                        <p className="text-xs text-concrete-500">Talle {i.size}</p>
                      </div>
                      <button onClick={() => remove(i.productId, i.size)} aria-label={`Quitar ${i.title}`} className="h-fit p-1 text-concrete-400 hover:text-alert">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-concrete-300">
                        <button onClick={() => setQty(i.productId, i.size, i.quantity - 1)} aria-label="Restar uno" className="p-2 hover:bg-concrete-100">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm" aria-live="polite">{i.quantity}</span>
                        <button onClick={() => setQty(i.productId, i.size, i.quantity + 1)} aria-label="Sumar uno" className="p-2 hover:bg-concrete-100">
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(i.unitPrice * i.quantity)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="space-y-3 border-t border-concrete-200 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-street text-concrete-500">Subtotal</span>
                <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-concrete-500">El envío y las cuotas se coordinan en el siguiente paso.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary w-full">
                Finalizar compra
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
