import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import ViewTracker from "@/components/ViewTracker";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { effectivePrice } from "@/lib/format";
import { CATEGORY_LABEL, type Category } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description.replace(/\s+/g, " ").slice(0, 155),
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: Params) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();

  const related = (await getProducts({ category: p.category })).filter((r) => r.id !== p.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description,
    image: p.images.map((i) => i.url),
    offers: { "@type": "Offer", priceCurrency: "ARS", price: effectivePrice(p), availability: "https://schema.org/InStock" },
  };

  return (
    <div className="container-x pt-8 sm:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ViewTracker productId={p.id} />

      <nav aria-label="Migas de pan" className="mb-6 text-[11px] font-semibold uppercase tracking-street text-concrete-400">
        <Link href="/productos" className="hover:text-ink">Productos</Link>
        <span className="mx-2">/</span>
        <Link href={`/productos?rubro=${p.category}`} className="hover:text-ink">
          {CATEGORY_LABEL[p.category as Category] ?? p.category}
        </Link>
      </nav>

      <ProductDetail product={p} />

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="rel">
          <h2 id="rel" className="mb-8 font-display text-2xl font-extrabold uppercase tracking-wide">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
