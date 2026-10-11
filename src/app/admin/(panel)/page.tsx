import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { getAllProductsAdmin } from "@/lib/queries";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABEL, GENDER_LABEL, type Category, type Gender } from "@/lib/constants";
import ProductRowActions from "./ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const products = await getAllProductsAdmin();
  const totalViews = products.reduce((n, p) => n + p.views, 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold uppercase">Productos</h1>
          <p className="mt-1 text-xs text-concrete-500">{products.length} productos · {totalViews} visitas totales</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary"><Plus size={14} /> Nuevo producto</Link>
      </div>

      <div className="overflow-x-auto border border-concrete-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-concrete-200 text-[11px] uppercase tracking-street text-concrete-500">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Género</th>
              <th className="p-3">Rubro</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Talles</th>
              <th className="p-3"><Eye size={14} aria-label="Visitas" /></th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-concrete-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-concrete-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]?.url ?? "/placeholder.svg"} alt="" className="h-12 w-10 bg-concrete-100 object-cover" />
                    <span className="font-semibold">{p.title}</span>
                  </div>
                </td>
                <td className="p-3">{GENDER_LABEL[p.gender as Gender] ?? p.gender}</td>
                <td className="p-3">{CATEGORY_LABEL[p.category as Category] ?? p.category}</td>
                <td className="p-3">
                  {p.salePrice ? (
                    <>{formatPrice(p.salePrice)} <span className="text-xs text-concrete-400 line-through">{formatPrice(p.price)}</span></>
                  ) : (
                    formatPrice(p.price)
                  )}
                </td>
                <td className="p-3 text-xs text-concrete-500">{p.sizes.map((s) => s.label).join(", ")}</td>
                <td className="p-3 tabular-nums">{p.views}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${p.active ? "bg-green-100 text-green-800" : "bg-concrete-200 text-concrete-500"}`}>
                    {p.active ? "Activo" : "Oculto"}
                  </span>
                </td>
                <td className="p-3"><ProductRowActions id={p.id} title={p.title} active={p.active} /></td>
              </tr>
            ))}
            {!products.length && (
              <tr><td colSpan={8} className="p-10 text-center text-concrete-500">Todavía no hay productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
