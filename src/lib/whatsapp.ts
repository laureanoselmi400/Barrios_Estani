const number = () => process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5492477698738";

/** Enlace wa.me (abre WhatsApp Web en desktop o la app en mobile). */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${number()}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function contactMessage(d: { name: string; phone: string; message: string }) {
  return [
    "Hola BARRIO STREET! 👋",
    "",
    `*Nombre:* ${d.name}`,
    `*Teléfono:* ${d.phone}`,
    "",
    "*Consulta:*",
    d.message,
  ].join("\n");
}
