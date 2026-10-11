import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "La historia, el concepto y la filosofía de BARRIO STREET, tienda de ropa de Pergamino.",
};

const VALUES = [
  { t: "Industria nacional", d: "Ropa hecha en Argentina. Apostamos al trabajo local y a prendas pensadas para nuestro clima y nuestro día a día." },
  { t: "Diseño urbano", d: "Líneas limpias, paleta sobria y piezas que combinan con todo. Menos ruido, más actitud." },
  { t: "Calidad real", d: "Materiales y confección elegidos para el uso diario: que aguanten la calle y los lavados." },
  { t: "Cercanía", d: "Somos un local de barrio. Te asesoramos en el local, por WhatsApp o por Instagram." },
];

export default function NosotrosPage() {
  return (
    <div>
      <section className="bg-ink text-paper">
        <div className="container-x py-16 sm:py-24">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-brand">Sobre nosotros</p>
          <h1 className="max-w-4xl font-logo text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-8xl">
            Ropa de acá,<br /><span className="text-brand">para la calle.</span>
          </h1>
        </div>
      </section>

      <section className="container-x grid gap-10 py-16 md:grid-cols-2 md:gap-20">
        <h2 className="font-logo text-3xl font-extrabold tracking-tight">Nuestra historia</h2>
        {/* TODO: reemplazar por la historia real de la marca */}
        <div className="space-y-5 text-base leading-relaxed text-ink-soft">
          <p>
            Barrio es una tienda de ropa de Pergamino con una idea simple: vestir la calle con identidad propia y
            productos de industria nacional. Nacimos mostrando cada prenda en Instagram y charlando con quienes se
            acercaban al local de Mitre 493.
          </p>
          <p>
            Hoy seguimos igual: elegimos cada pieza una por una, cuidamos el calce y los detalles, y armamos
            colecciones para hombre, mujer y unisex pensadas para el día a día.
          </p>
        </div>
      </section>

      <section className="bg-concrete-100 py-16">
        <div className="container-x">
          <h2 className="mb-10 font-logo text-3xl font-extrabold tracking-tight">Qué nos mueve</h2>
          <div className="grid gap-px bg-concrete-300 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <div key={v.t} className="bg-concrete-100 p-6">
                <span className="inline-block bg-brand px-2 py-0.5 font-logo text-sm font-bold">0{i + 1}</span>
                <h3 className="mb-2 mt-4 text-sm font-bold uppercase tracking-street">{v.t}</h3>
                <p className="text-sm leading-relaxed text-concrete-500">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 text-center">
        <h2 className="font-logo text-4xl font-extrabold tracking-tight">Pasá a conocernos<span className="text-brand-dark">.</span></h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-concrete-500">Visitá el local en Mitre 493, escribinos o mirá la colección completa online.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/productos" className="btn-primary">Ver productos</Link>
          <Link href="/contacto" className="btn-outline">Contacto</Link>
        </div>
      </section>
    </div>
  );
}
