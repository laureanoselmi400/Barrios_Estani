import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayment, mapMpStatus, verifyWebhookSignature } from "@/lib/mercadopago";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}) as Record<string, any>);

  const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = String(body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  if (
    !verifyWebhookSignature({
      signature: req.headers.get("x-signature"),
      requestId: req.headers.get("x-request-id"),
      dataId: url.searchParams.get("data.id") ?? dataId,
    })
  ) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (type !== "payment" || !dataId) return NextResponse.json({ ok: true });

  try {
    // Se consulta el pago directamente a Mercado Pago: no se confía en el payload recibido.
    const payment = await getPayment(dataId);
    const orderId = payment.external_reference;
    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId, status: { not: "PAID" } },
        data: { status: mapMpStatus(payment.status), externalId: String(payment.id) },
      });
    }
  } catch (err) {
    console.error("[webhook mp]", err);
    return NextResponse.json({ error: "Error procesando" }, { status: 500 }); // MP reintenta
  }
  return NextResponse.json({ ok: true });
}
