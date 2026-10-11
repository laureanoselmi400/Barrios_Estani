"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { discountPct, effectivePrice, formatPrice } from "@/lib/format";
import { CATEGORY_LABEL, type Category } from "@/lib/constants";

type Props = {
  product: {
    slug: string;
    title: string;
    price: number;
    salePrice: number | null;
    category: string;
    images: { url: string }[];
    sizes: { label: string }[];
  };
  priority?: boolean;
};

export default function ProductCard({ product: p, priority }: Props) {
  const [idx, setIdx] = useState(0);
  const imgs = p.images.length ? p.images : [{ url: "/placeholder.svg" }];
  const discount = discountPct(p);
  const hasSale = discount > 0;

  const go = (e: React.MouseEvent, dir: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + dir + imgs.length) % imgs.length);
  };

  return (
    <article className="group">
      <Link href={`/productos/${p.slug}`} className="block" aria-label={p.title}>
        <div
          className="relative aspect-[4/5] overflow-hidden bg-concrete-100"
          // En desktop, al pasar el mouse se muestra la segunda imagen
          onMouseEnter={() => imgs.length > 1 && setIdx(1)}
          onMouseLeave={() => setIdx(0)}
        >
          {imgs.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.url + i}
              src={img.url}
              alt={i === 0 ? p.title : ""}
              loading={priority && i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {hasSale && (
            <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
              -{discount}%
            </span>
          )}

          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => go(e, -1)}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-paper/90 p-1.5 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 max-md:opacity-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => go(e, 1)}
                aria-label="Imagen siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-paper/90 p-1.5 opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100 max-md:opacity-100"
              >
                <ChevronRight size={16} />
              </button>
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {imgs.map((_, i) => (
                  <span key={i} className={`h-1 w-4 transition-colors ${i === idx ? "bg-ink" : "bg-paper/70"}`} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-street text-concrete-400">
            {CATEGORY_LABEL[p.category as Category] ?? p.category}
          </p>
          <h3 className="mt-1 text-sm font-semibold leading-snug">{p.title}</h3>
          <p className="mt-1.5 flex items-baseline gap-2 text-sm">
            <span className="font-bold">{formatPrice(effectivePrice(p))}</span>
            {hasSale && <span className="text-xs text-concrete-400 line-through">{formatPrice(p.price)}</span>}
          </p>
          <p className="mt-1.5 text-[11px] text-concrete-500">{p.sizes.map((s) => s.label).join(" · ")}</p>
        </div>
      </Link>
    </article>
  );
}
