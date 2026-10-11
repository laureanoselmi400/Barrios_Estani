import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Incrementa el contador de visitas. Lo invoca un componente cliente (ViewTracker)
// una vez por sesión de navegador, así se evitan conteos por prefetch o bots simples.
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await prisma.product.update({ where: { id }, data: { views: { increment: 1 } }, select: { id: true } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
