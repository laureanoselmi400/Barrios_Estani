import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import ClearCart from "@/components/ClearCart";

export const metadata: Metadata = { title: "Resultado del pago", robots: { index: false } };
export const dynamic = "force-dynamic";

const VIEW = {
  PAID: { Icon: CheckCircle2, title: "¡Pago aprobado!", text: "Recibimos tu pedido. Te vamos a contactar para coordinar el envío o el retiro.", color: "text-green-700" },
  PENDING: { Icon: Clock, title: "Pago en proceso", text: "Estamos esperando la confirmación del pago. Te avisamos apenas se acredite.", color: "text-concrete-500" },
  REJECTED: { Icon: XCircle, title: "El pago no se completó", text: "No se pudo procesar el pago. Podés intentarlo de nuevo o elegir otro medio.", color: "text-alert" },
  CANCELLED: { Icon: XCircle, title: "Pedido cancelado", text: "El pedido fue cancelado. Si fue un error, volvé a intentarlo.", color: "text-alert" },
} as const;

export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: id } = await searchParams;
  const order = id ? await prisma.order.findUnique({ where: { id }, include: { items: true } }) : null;

  if (!order) {
    return (
      <div className="container-x py-28 text-center">
        <h1 className="font-display text-3xl font-extrabold uppercase">Pedido no encontrado</h1>
        <Link href="/" className="btn-primary mt-8">Volver al inicio</Link>
      </div>
    );
  }

  const v = VIEW[order.status as keyof typeof VIEW] ?? VIEW.PENDING;

  return (
    <div className="container-x max-w-2xl py-16 sm:py-24">
      {order.status === "PAID" && <ClearCart />}
      <div className="text-center">
        <v.Icon size={48} className={`mx-auto ${v.color}`} />
        <h1 className="mt-5 font-display text-3xl font-black uppercase sm:text-4xl">{v.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-concrete-500">{v.text}</p>
        <p className="mt-2 text-xs text-concrete-400">Pedido #{order.id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="mt-10 border border-concrete-200 bg-white p-6">
        <ul className="divide-y divide-concrete-100 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3">
              <span>{i.title} <span className="text-concrete-500">· Talle {i.size} × {i.quantity}</span></span>
              <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-concrete-200 pt-4 font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order.status === "REJECTED" || order.status === "CANCELLED" ? (
          <Link href="/checkout" className="btn-primary">Reintentar</Link>
        ) : (
          <Link href="/productos" className="btn-primary">Seguir comprando</Link>
        )}
        <Link href="/contacto" className="btn-outline">Contacto</Link>
      </div>
    </div>
  );
}
