import type { Metadata } from "next";
import { Instagram, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import Hours from "@/components/Hours";
import { SITE } from "@/lib/constants";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos por WhatsApp, visitá el local en Mitre 493, Pergamino, o seguinos en Instagram.",
};

export default function ContactoPage() {
  return (
    <div className="container-x py-12 sm:py-20">
      <h1 className="font-logo text-5xl font-extrabold tracking-tight sm:text-7xl">Contacto<span className="text-brand-dark">.</span></h1>
      <p className="mt-3 max-w-lg text-sm text-concrete-500">Consultas por talles, stock, cambios o retiro en el local. Te respondemos por WhatsApp.</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-24">
        <ContactForm />

        <div className="space-y-8">
          <ul className="space-y-5 text-sm">
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0" />
              <div>
                <a href={`tel:${SITE.phoneE164}`} className="font-semibold underline underline-offset-4">{SITE.phoneDisplay}</a>
                <p className="mt-1 text-xs text-concrete-500">
                  <a href={whatsappLink("Hola BARRIO STREET! Quería hacerles una consulta 👋")} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-ink">
                    Escribinos por WhatsApp
                  </a>
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{SITE.address}</p>
                <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-4">Cómo llegar</a>
              </div>
            </li>
            <li className="flex gap-3">
              <Instagram size={18} className="shrink-0" />
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">@{SITE.instagram}</a>
            </li>
          </ul>

          <div className="border border-concrete-200 bg-white p-5">
            <h2 className="label">Horarios</h2>
            <Hours />
          </div>

          <div className="aspect-video overflow-hidden border border-concrete-200 bg-concrete-100">
            <iframe
              title="Ubicación del local"
              src={SITE.mapsEmbed}
              loading="lazy"
              className="h-full w-full"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
