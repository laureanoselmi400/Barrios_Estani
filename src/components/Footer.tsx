import Link from "next/link";
import { Instagram, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/constants";
import Logo from "@/components/Logo";
import Hours from "@/components/Hours";

const PAYMENTS = ["Mercado Pago", "GO Cuotas", "Visa", "Mastercard", "Débito"];

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.1fr_0.7fr_1.2fr_1fr]">
        <div>
          <Logo size="md" className="items-start" />
          <p className="mt-4 max-w-xs text-sm text-concrete-300">Tienda de ropa, industria nacional 🇦🇷. Hombre, mujer y unisex.</p>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-street text-brand">Navegá</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/productos" className="hover:text-brand">Productos</Link></li>
            <li><Link href="/nosotros" className="hover:text-brand">Sobre Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-brand">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-street text-brand">Local</h3>
          <p className="mb-3 flex gap-2.5 text-sm text-concrete-200">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand">
              {SITE.address} <span className="text-concrete-400">(ver mapa)</span>
            </a>
          </p>
          <p className="mb-3 flex gap-2.5 text-sm text-concrete-200">
            <Phone size={16} className="mt-0.5 shrink-0" />
            <a href={`tel:${SITE.phoneE164}`} className="hover:text-brand">
              {SITE.phoneDisplay}
            </a>
          </p>
          <Hours className="max-w-sm text-concrete-200" />
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-street text-brand">Seguinos</h3>
          <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-brand">
            <Instagram size={18} /> @{SITE.instagram}
          </a>
          <h3 className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-street text-brand">Medios de pago</h3>
          <ul className="flex flex-wrap gap-2">
            {PAYMENTS.map((p) => (
              <li key={p} className="border border-white/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-concrete-200">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-x py-5 text-[11px] text-concrete-400">
          © {new Date().getFullYear()} BARRIO STREET · Pergamino, Buenos Aires. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
