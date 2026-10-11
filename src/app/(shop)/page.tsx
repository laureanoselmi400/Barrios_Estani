import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Logo from "@/components/Logo";
import Hours from "@/components/Hours";
import { getFeaturedProducts } from "@/lib/queries";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic"; // destacados siempre actualizados según las visitas

const GENDER_TILES = [
  { label: "Hombre", href: "/productos?genero=HOMBRE", cls: "bg-ink text-brand" },
  { label: "Mujer", href: "/productos?genero=MUJER", cls: "bg-brand text-ink" },
  { label: "Unisex", href: "/productos?genero=UNISEX", cls: "bg-concrete-100 text-ink" },
];

const MARQUEE = ["Tienda de ropa", "Industria nacional 🇦🇷", "Pergamino, Buenos Aires", "Hombre · Mujer · Unisex"];

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);
  // Para usar una foto de campaña: guardarla como public/hero.jpg
  const hasHeroImage = existsSync(path.join(process.cwd(), "public", "hero.jpg"));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        {hasHeroImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero.jpg" alt="Campaña Barrio" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
          </>
        )}
        <div className="container-x flex min-h-[78vh] flex-col items-start justify-end pb-12 pt-24 sm:pb-16">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.4em] text-concrete-300">
            Nueva colección · Industria nacional 🇦🇷
          </p>
          <Logo size="xl" className="-ml-[0.04em] items-start" />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/productos" className="btn-brand">
              Ver Colección <ArrowRight size={16} />
            </Link>
            <span className="text-xs text-concrete-300">
              Pagá con Mercado Pago o en cuotas con GO Cuotas
            </span>
          </div>
        </div>
      </section>

      {/* Cinta */}
      <div className="overflow-hidden bg-brand py-3 text-ink" aria-hidden="true">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="flex items-center gap-10 text-xs font-bold uppercase tracking-[0.3em]">
              {t} <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            </span>
          ))}
        </div>
      </div>

      {/* Accesos por género */}
      <section className="container-x mt-16 sm:mt-20" aria-labelledby="genero-title">
        <h2 id="genero-title" className="sr-only">Comprá por género</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {GENDER_TILES.map((g) => (
            <Link
              key={g.label}
              href={g.href}
              className={`group relative flex aspect-[16/7] items-end justify-between p-6 transition-transform duration-300 hover:-translate-y-1 sm:aspect-[3/4] ${g.cls}`}
            >
              <span className="font-logo text-4xl font-extrabold tracking-tight sm:text-5xl">{g.label}.</span>
              <ArrowUpRight size={28} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="container-x mt-20 sm:mt-28" aria-labelledby="destacados-title">
        <div className="mb-8 flex items-end justify-between">
          <h2 id="destacados-title" className="font-logo text-3xl font-extrabold tracking-tight sm:text-5xl">
            Lo más visto<span className="text-brand-dark">.</span>
          </h2>
          <Link href="/productos" className="text-xs font-semibold uppercase tracking-street underline underline-offset-4">
            Ver todo
          </Link>
        </div>

        {featured.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-concrete-500">Pronto vas a encontrar acá los productos más vistos.</p>
        )}
      </section>

      {/* Visitá el local */}
      <section className="container-x mt-24 sm:mt-32" aria-labelledby="local-title">
        <div className="grid gap-10 bg-ink p-8 text-paper sm:p-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-brand">Visitá el local</p>
            <h2 id="local-title" className="mt-4 font-logo text-4xl font-extrabold leading-none tracking-tight sm:text-6xl">
              Te esperamos en<br />Pergamino.
            </h2>
            <p className="mt-6 flex items-start gap-2 text-sm text-concrete-200">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" /> {SITE.address}
            </p>
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-brand mt-6">
              Cómo llegar <ArrowUpRight size={16} />
            </a>
          </div>
          <Hours className="self-center" />
        </div>
      </section>
    </>
  );
}
