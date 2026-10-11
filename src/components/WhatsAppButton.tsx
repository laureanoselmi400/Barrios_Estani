import { whatsappLink } from "@/lib/whatsapp";

/** Botón flotante de WhatsApp (esquina inferior derecha, discreto). */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hola BARRIO STREET! Quería hacerles una consulta 👋")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white opacity-90 shadow-lg shadow-black/15 transition-all duration-300 hover:scale-110 hover:opacity-100 md:h-14 md:w-14"
    >
      {/* Logo oficial de WhatsApp (SVG) */}
      <svg viewBox="0 0 32 32" className="h-6 w-6 md:h-7 md:w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.003 3C8.83 3 3.002 8.826 3 15.996c0 2.294.6 4.533 1.74 6.507L3 29l6.646-1.744a12.97 12.97 0 0 0 6.352 1.62h.005c7.172 0 13-5.827 13.003-12.997A12.92 12.92 0 0 0 25.2 6.8 12.9 12.9 0 0 0 16.003 3Zm0 23.7h-.004a10.78 10.78 0 0 1-5.5-1.506l-.394-.234-3.944 1.035 1.053-3.844-.257-.41a10.77 10.77 0 0 1-1.65-5.745c.002-5.954 4.85-10.8 10.8-10.8 2.886 0 5.598 1.126 7.637 3.168a10.73 10.73 0 0 1 3.157 7.644c-.003 5.955-4.85 10.801-10.798 10.801Zm5.923-8.087c-.325-.163-1.921-.948-2.218-1.056-.298-.108-.515-.163-.731.163-.217.325-.84 1.056-1.03 1.272-.19.217-.38.244-.704.081-.325-.163-1.37-.505-2.608-1.61-.964-.86-1.615-1.922-1.804-2.247-.19-.325-.02-.5.142-.662.146-.146.325-.38.488-.57.163-.19.217-.325.325-.542.109-.217.054-.407-.027-.57-.081-.162-.731-1.763-1.002-2.414-.264-.634-.532-.548-.731-.558l-.623-.011c-.217 0-.57.081-.868.407-.298.325-1.139 1.113-1.139 2.713s1.166 3.147 1.329 3.364c.162.217 2.294 3.502 5.557 4.912.776.335 1.382.535 1.854.685.78.248 1.49.213 2.05.129.625-.093 1.921-.785 2.192-1.544.27-.759.27-1.41.19-1.545-.082-.135-.299-.217-.624-.38Z" />
      </svg>
    </a>
  );
}
