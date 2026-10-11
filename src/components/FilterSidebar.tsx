"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import clsx from "clsx";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  GENDERS,
  GENDER_LABEL,
  SORT_OPTIONS,
} from "@/lib/constants";

/**
 * Los filtros viven en la URL (searchParams): la página es un Server Component que
 * consulta Prisma con esos parámetros → SEO, enlaces compartibles y "atrás" funcional.
 * Los campos de texto/precio se aplican con debounce para sentirse en tiempo real.
 */
export default function FilterSidebar({ sizes, total }: { sizes: string[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [q, setQ] = useState(params.get("q") ?? "");
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const gender = params.get("genero") ?? "";
  const category = params.get("rubro") ?? "";
  const size = params.get("talle") ?? "";
  const sort = params.get("orden") ?? "vistos";

  const push = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    startTransition(() => router.replace(`${pathname}?${sp.toString()}`, { scroll: false }));
  };

  // Debounce de búsqueda y precios
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (q !== (params.get("q") ?? "") || min !== (params.get("min") ?? "") || max !== (params.get("max") ?? "")) {
        push({ q: q.trim() || null, min: min || null, max: max || null });
      }
    }, 400);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, min, max]);

  const hasFilters = !!(gender || category || size || q || min || max);
  const clearAll = () => {
    setQ("");
    setMin("");
    setMax("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  const chip = (active: boolean) =>
    clsx(
      "border px-3 py-1.5 text-xs font-medium transition-colors",
      active ? "border-ink bg-ink text-paper" : "border-concrete-300 hover:border-ink",
    );

  const content = (
    <div className="space-y-7">
      <div>
        <label htmlFor="q" className="label">Buscar</label>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete-400" />
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Remera, cargo, puffer…"
            className="input pl-9"
          />
        </div>
      </div>

      <div>
        <label htmlFor="orden" className="label">Ordenar por</label>
        <select id="orden" value={sort} onChange={(e) => push({ orden: e.target.value === "vistos" ? null : e.target.value })} className="input">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Género</legend>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <button key={g} aria-pressed={gender === g} onClick={() => push({ genero: gender === g ? null : g })} className={chip(gender === g)}>
              {GENDER_LABEL[g]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Rubro</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} aria-pressed={category === c} onClick={() => push({ rubro: category === c ? null : c })} className={chip(category === c)}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Talle</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button key={s} aria-pressed={size === s} onClick={() => push({ talle: size === s ? null : s })} className={clsx(chip(size === s), "min-w-[2.75rem]")}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Precio (ARS)</legend>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder="Mínimo" className="input" aria-label="Precio mínimo" />
          <span className="text-concrete-400">—</span>
          <input type="number" inputMode="numeric" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder="Máximo" className="input" aria-label="Precio máximo" />
        </div>
      </fieldset>

      {hasFilters && (
        <button onClick={clearAll} className="text-xs font-semibold uppercase tracking-street underline underline-offset-4">
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: botón + panel desplegable */}
      <div className="flex items-center justify-between lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="btn-outline !px-4 !py-2.5">
          <SlidersHorizontal size={14} /> Filtros{hasFilters && " •"}
        </button>
        <span className={clsx("text-xs text-concrete-500", pending && "animate-pulse")}>{total} productos</span>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 animate-fade-in bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm animate-slide-in overflow-y-auto bg-paper p-5 [animation-direction:normal]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-wider">Filtros</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Cerrar filtros"><X size={22} /></button>
            </div>
            {content}
            <button onClick={() => setMobileOpen(false)} className="btn-primary mt-8 w-full">
              Ver {total} productos
            </button>
          </div>
        </div>
      )}

      {/* Desktop: sidebar fijo */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">{content}</div>
      </aside>
    </>
  );
}
