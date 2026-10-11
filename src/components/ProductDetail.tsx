"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { discountPct, effectivePrice, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";

type P = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: { url: string }[];
  sizes: { label: string }[];
};

export default function ProductDetail({ product: p }: { product: P }) {
  const add = useCart((s) => s.add);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const imgs = p.images.length ? p.images : [{ url: "/placeholder.svg" }];
  const discount = discountPct(p);

  const onAdd = () => {
    if (!size) return setError(true);
    add({
      productId: p.id,
      slug: p.slug,
      title: p.title,
      image: imgs[0].url === "/placeholder.svg" ? null : imgs[0].url,
      size,
      unitPrice: effectivePrice(p),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
      {/* Galería */}
      <div className="grid gap-3 md:grid-cols-[80px_1fr]">
        <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col">
          {imgs.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              className={clsx("h-20 w-16 shrink-0 overflow-hidden border-2 transition-colors md:h-24 md:w-full", i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <div className="order-1 aspect-[4/5] overflow-hidden bg-concrete-100 md:order-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgs[active].url} alt={p.title} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Info */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h1 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-wide sm:text-3xl">{p.title}</h1>

        <p className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="text-2xl font-bold">{formatPrice(effectivePrice(p))}</span>
          {discount > 0 && (
            <>
              <span className="text-concrete-400 line-through">{formatPrice(p.price)}</span>
              <span className="bg-accent px-2 py-0.5 text-[11px] font-bold">-{discount}%</span>
            </>
          )}
        </p>

        <fieldset className="mt-8">
          <legend className="label">Talle {error && <span className="ml-2 normal-case tracking-normal text-alert">· elegí un talle</span>}</legend>
          <div className="flex flex-wrap gap-2">
            {p.sizes.map((s) => (
              <button
                key={s.label}
                aria-pressed={size === s.label}
                onClick={() => {
                  setSize(s.label);
                  setError(false);
                }}
                className={clsx(
                  "min-w-[3rem] border px-3 py-2.5 text-sm font-medium transition-colors",
                  size === s.label ? "border-ink bg-ink text-paper" : "border-concrete-300 hover:border-ink",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button onClick={onAdd} className="btn-primary mt-6 w-full !py-4">
          {added ? <><Check size={16} /> Agregado</> : <><ShoppingBag size={16} /> Agregar al carrito</>}
        </button>

        <div className="mt-10 border-t border-concrete-200 pt-6">
          <h2 className="label">Detalles</h2>
          <div className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.description}</div>
        </div>
      </div>
    </div>
  );
}
