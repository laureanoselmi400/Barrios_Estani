"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, Lock } from "lucide-react";
import clsx from "clsx";
import { formatPrice } from "@/lib/format";
import { selectSubtotal, useCart } from "@/store/cart";

type Method = "MERCADOPAGO" | "GOCUOTAS";

const METHODS: { id: Method; name: string; desc: string }[] = [
  { id: "MERCADOPAGO", name: "Mercado Pago", desc: "Tarjetas de crédito y débito, dinero en cuenta, efectivo y más." },
  { id: "GOCUOTAS", name: "GO Cuotas", desc: "Pagá en cuotas sin tarjeta de crédito, solo con tu tarjeta de débito." },
];

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<Method>("MERCADOPAGO");
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  const set = (k: keyof typeof buyer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setBuyer((b) => ({ ...b, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          buyer: { ...buyer, address: buyer.address || undefined },
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "No pudimos iniciar el pago");
      window.location.href = data.url; // el carrito se vacía al volver con pago aprobado
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!items.length) {
    return (
      <div className="container-x py-28 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Tu carrito está vacío</h1>
        <Link href="/productos" className="btn-primary mt-8">Ver productos</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10 sm:py-16">
      <h1 className="mb-10 font-display text-4xl font-black uppercase sm:text-5xl">Checkout</h1>

      <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="space-y-10">
          <section aria-labelledby="datos">
            <h2 id="datos" className="mb-5 text-sm font-bold uppercase tracking-street">1. Tus datos</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="c-name" className="label">Nombre y apellido</label>
                <input id="c-name" required minLength={2} value={buyer.name} onChange={set("name")} className="input" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="c-email" className="label">Email</label>
                <input id="c-email" type="email" required value={buyer.email} onChange={set("email")} className="input" autoComplete="email" />
              </div>
              <div>
                <label htmlFor="c-phone" className="label">Teléfono</label>
                <input id="c-phone" type="tel" required minLength={6} value={buyer.phone} onChange={set("phone")} className="input" autoComplete="tel" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-addr" className="label">Dirección de envío (opcional)</label>
                <input id="c-addr" value={buyer.address} onChange={set("address")} className="input" autoComplete="street-address" placeholder="Calle, número, localidad. Dejalo vacío para retirar en el local." />
              </div>
            </div>
          </section>

          <fieldset>
            <legend className="mb-5 text-sm font-bold uppercase tracking-street">2. Método de pago</legend>
            <div className="space-y-3">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={clsx(
                    "flex cursor-pointer items-start gap-4 border p-4 transition-colors",
                    method === m.id ? "border-ink bg-white" : "border-concrete-300 hover:border-concrete-400",
                  )}
                >
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="mt-1 accent-ink" />
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold"><CreditCard size={16} /> {m.name}</p>
                    <p className="mt-1 text-xs text-concrete-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Resumen */}
        <aside className="h-fit border border-concrete-200 bg-white p-6 lg:sticky lg:top-24" aria-label="Resumen del pedido">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-street">Resumen</h2>
          <ul className="divide-y divide-concrete-100">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image ?? "/placeholder.svg"} alt="" className="h-16 w-14 shrink-0 bg-concrete-100 object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold">{i.title}</p>
                  <p className="text-xs text-concrete-500">Talle {i.size} · {formatPrice(i.unitPrice)} × {i.quantity}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(i.unitPrice * i.quantity)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-concrete-200 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-concrete-500">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-concrete-500">Envío</dt><dd className="text-xs text-concrete-500">A coordinar</dd></div>
            <div className="flex justify-between border-t border-concrete-200 pt-3 text-base font-bold"><dt>Total</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between text-xs text-concrete-500"><dt>Pagás con</dt><dd>{METHODS.find((m) => m.id === method)?.name}</dd></div>
          </dl>

          {error && <p role="alert" className="mt-4 bg-alert/10 p-3 text-xs text-alert">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full !py-4">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Redirigiendo…</> : <><Lock size={14} /> Pagar {formatPrice(subtotal)}</>}
          </button>
          <p className="mt-3 text-center text-[11px] text-concrete-500">Serás redirigido a la plataforma de pago. El total final se confirma con los precios vigentes.</p>
        </aside>
      </form>
    </div>
  );
}
