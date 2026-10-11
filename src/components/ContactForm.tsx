"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { contactMessage, whatsappLink } from "@/lib/whatsapp";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = whatsappLink(
      contactMessage({ name: form.name.trim(), phone: form.phone.trim(), message: form.message.trim() }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="label">Nombre</label>
        <input id="name" required minLength={2} value={form.name} onChange={set("name")} className="input" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Teléfono</label>
        <input id="phone" type="tel" required minLength={6} value={form.phone} onChange={set("phone")} className="input" autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="message" className="label">Mensaje</label>
        <textarea id="message" required minLength={5} rows={5} value={form.message} onChange={set("message")} className="input resize-none" />
      </div>
      <button type="submit" className="btn-primary w-full !py-4">
        <MessageCircle size={16} /> Enviar por WhatsApp
      </button>
      <p className="text-[11px] text-concrete-500">Se abrirá WhatsApp con tu consulta lista para enviar.</p>
    </form>
  );
}
