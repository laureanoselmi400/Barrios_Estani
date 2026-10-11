import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { createHmac, timingSafeEqual } from "node:crypto";

const client = () => {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken: token, options: { timeout: 8000 } });
};

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

type PrefItem = { id: string; title: string; quantity: number; unit_price: number; picture_url?: string };

/** Crea una preferencia de Checkout Pro y devuelve id + URL de redirección. */
export async function createPreference(args: {
  orderId: string;
  items: PrefItem[];
  payer: { name: string; email: string; phone: string };
}) {
  const base = siteUrl();
  const isLocal = base.includes("localhost");

  const pref = await new Preference(client()).create({
    body: {
      items: args.items.map((i) => ({ ...i, currency_id: "ARS" })),
      payer: { name: args.payer.name, email: args.payer.email },
      external_reference: args.orderId,
      back_urls: {
        success: `${base}/checkout/resultado?order=${args.orderId}`,
        failure: `${base}/checkout/resultado?order=${args.orderId}`,
        pending: `${base}/checkout/resultado?order=${args.orderId}`,
      },
      // MP no acepta localhost como notification_url ni auto_return con back_urls locales
      ...(isLocal ? {} : { auto_return: "approved", notification_url: `${base}/api/webhooks/mercadopago` }),
      statement_descriptor: "BARRIO STREET",
    },
  });

  return { id: pref.id!, url: pref.init_point! };
}

export async function getPayment(id: string) {
  return new Payment(client()).get({ id });
}

/** Verifica la firma x-signature de los webhooks de Mercado Pago. */
export function verifyWebhookSignature(opts: {
  signature: string | null;
  requestId: string | null;
  dataId: string | null;
}) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto configurado no se puede verificar (ok en desarrollo)
  if (!opts.signature || !opts.dataId) return false;

  const parts = Object.fromEntries(
    opts.signature.split(",").map((p) => p.trim().split("=") as [string, string]),
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${opts.dataId};request-id:${opts.requestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function mapMpStatus(status?: string) {
  switch (status) {
    case "approved":
      return "PAID";
    case "rejected":
      return "REJECTED";
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}
