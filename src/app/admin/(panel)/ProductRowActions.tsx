"use client";

import Link from "next/link";
import { useTransition } from "react";
import { EyeOff, Eye, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, toggleActive } from "../actions";

export default function ProductRowActions({ id, title, active }: { id: string; title: string; active: boolean }) {
  const [pending, start] = useTransition();

  return (
    <div className={`flex items-center justify-end gap-1 ${pending ? "opacity-50" : ""}`}>
      <button
        onClick={() => start(() => toggleActive(id, !active))}
        aria-label={active ? `Ocultar ${title}` : `Mostrar ${title}`}
        title={active ? "Ocultar" : "Mostrar"}
        className="p-2 hover:bg-concrete-100"
      >
        {active ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <Link href={`/admin/productos/${id}`} aria-label={`Editar ${title}`} className="p-2 hover:bg-concrete-100"><Pencil size={15} /></Link>
      <button
        onClick={() => {
          if (confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) start(() => deleteProduct(id));
        }}
        aria-label={`Eliminar ${title}`}
        className="p-2 text-alert hover:bg-alert/10"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
