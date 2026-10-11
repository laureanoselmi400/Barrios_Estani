import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries";
import ProductForm from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const p = await getProductById((await params).id);
  if (!p) notFound();

  return (
    <>
      <h1 className="mb-1 font-display text-3xl font-extrabold uppercase">Editar producto</h1>
      <p className="mb-6 text-xs text-concrete-500">{p.views} visitas</p>
      <ProductForm
        id={p.id}
        initial={{
          title: p.title,
          description: p.description,
          price: String(p.price),
          salePrice: p.salePrice ? String(p.salePrice) : "",
          gender: p.gender,
          category: p.category,
          sizes: p.sizes.map((s) => s.label),
          images: p.images.map((i) => i.url),
          active: p.active,
        }}
      />
    </>
  );
}
