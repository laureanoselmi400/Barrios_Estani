import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapGoCuotasStatus } from "@/lib/gocuotas";

/**
 * Webhook de GO Cuotas. Ajustar los nombres de campos y agregar la verificación
 * (firma/token) según la documentación que provee GO Cuotas para tu comercio.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orderId: string | undefined = body?.order_reference_id ?? body?.order?.reference_id;
  const status: string | undefined = body?.status ?? body?.order?.status;
  if (!orderId) return NextResponse.json({ error: "Falta order_reference_id" }, { status: 400 });

  // Un pedido ya pagado no se degrada por notificaciones tardías/duplicadas.
  await prisma.order.updateMany({
    where: { id: orderId, status: { not: "PAID" } },
    data: { status: mapGoCuotasStatus(status) },
  });
  return NextResponse.json({ ok: true });
}
