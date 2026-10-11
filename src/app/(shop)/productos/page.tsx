import type { Metadata } from "next";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import { getAvailableSizes, getProducts } from "@/lib/queries";
import { CATEGORIES, GENDERS, SORT_OPTIONS, type Sort } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Productos",
  description: "Remeras, pantalones, sacos, abrigos, calzado y accesorios streetwear.",
};
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export default async function ProductosPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  const genero = one(sp.genero);
  const rubro = one(sp.rubro);
  const orden = one(sp.orden);

  // Se validan contra las listas permitidas antes de consultar
  const products = await getProducts({
    gender: GENDERS.find((g) => g === genero),
    category: CATEGORIES.find((c) => c === rubro),
    size: one(sp.talle),
    q: one(sp.q)?.trim().slice(0, 80) || undefined,
    min: num(one(sp.min)),
    max: num(one(sp.max)),
    sort: SORT_OPTIONS.find((o) => o.value === orden)?.value as Sort | undefined,
  });
  const sizes = await getAvailableSizes();

  return (
    <div className="container-x pt-10 sm:pt-14">
      <header className="mb-8 flex items-end justify-between border-b border-concrete-200 pb-6">
        <h1 className="font-display text-4xl font-black uppercase tracking-wide sm:text-5xl">Productos</h1>
        <p className="hidden text-sm text-concrete-500 lg:block" aria-live="polite">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <FilterSidebar sizes={sizes} total={products.length} />

        <section aria-label="Listado de productos">
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 6} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="font-display text-xl font-bold uppercase">Sin resultados</p>
              <p className="mt-2 text-sm text-concrete-500">Probá quitando algún filtro o buscando otra palabra.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
