import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/format";
import { createPreference } from "@/lib/mercadopago";
import { createGoCuotasCheckout } from "@/lib/gocuotas";

const schema = z.object({
  paymentMethod: z.enum(["MERCADOPAGO", "GOCUOTAS"]),
  buyer: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email(),
    phone: z.string().trim().min(6).max(30),
    address: z.string().trim().max(200).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { paymentMethod, buyer, items } = parsed.data;

  // Nunca confiar en precios del cliente: se recalculan desde la base de datos.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, sizes: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  for (const it of items) {
    const p = byId.get(it.productId);
    if (!p) return NextResponse.json({ error: "Un producto ya no está disponible" }, { status: 409 });
    if (!p.sizes.some((s) => s.label === it.size)) {
      return NextResponse.json({ error: `El talle ${it.size} no está disponible para ${p.title}` }, { status: 409 });
    }
    lines.push({
      productId: p.id,
      title: p.title,
      size: it.size,
      unitPrice: effectivePrice(p),
      quantity: it.quantity,
      image: p.images[0]?.url ?? null,
    });
  }
  const total = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);

  const order = await prisma.order.create({
    data: {
      paymentMethod,
      total,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      shippingAddress: buyer.address || null,
      items: { create: lines },
    },
  });

  try {
    if (paymentMethod === "MERCADOPAGO") {
      const pref = await createPreference({
        orderId: order.id,
        payer: { name: buyer.name, email: buyer.email, phone: buyer.phone },
        items: lines.map((l) => ({
          id: l.productId,
          title: `${l.title} (Talle ${l.size})`,
          quantity: l.quantity,
          unit_price: l.unitPrice,
          ...(l.image?.startsWith("http") && { picture_url: l.image }),
        })),
      });
      await prisma.order.update({ where: { id: order.id }, data: { externalId: pref.id } });
      return NextResponse.json({ url: pref.url, orderId: order.id });
    }

    const go = await createGoCuotasCheckout({
      orderId: order.id,
      total,
      phone: buyer.phone,
      email: buyer.email,
    });
    if (go.id) await prisma.order.update({ where: { id: order.id }, data: { externalId: go.id } });
    return NextResponse.json({ url: go.url, orderId: order.id });
  } catch (err) {
    console.error("[checkout]", err);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return NextResponse.json(
      { error: "No pudimos iniciar el pago. Probá nuevamente o elegí otro medio." },
      { status: 502 },
    );
  }
}
