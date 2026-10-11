import "server-only";
import { siteUrl } from "@/lib/mercadopago";

/**
 * GO Cuotas — integración por redirección (API Redirect).
 *
 * Flujo:
 *  1) POST {API}/api_redirect/v1/authentication  (email + password) -> token
 *  2) POST {API}/api_redirect/v1/checkouts       (Bearer token)     -> url_init
 *  3) Se redirige al cliente a url_init. GO Cuotas notifica el resultado al webhook_url.
 *
 * IMPORTANTE: los nombres exactos de campos y el esquema de verificación del webhook
 * dependen de la documentación que GO Cuotas entrega al comercio al darlo de alta.
 * Validar este archivo contra esa documentación antes de salir a producción.
 */

const api = () => process.env.GOCUOTAS_API_URL ?? "https://sandbox.gocuotas.com";

let cached: { token: string; at: number } | null = null;

async function getToken() {
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.token;

  const res = await fetch(`${api()}/api_redirect/v1/authentication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.GOCUOTAS_EMAIL,
      password: process.env.GOCUOTAS_PASSWORD,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GO Cuotas auth falló (${res.status})`);
  const data = (await res.json()) as { token: string };
  cached = { token: data.token, at: Date.now() };
  return data.token;
}

export async function createGoCuotasCheckout(args: {
  orderId: string;
  total: number; // en pesos
  phone: string;
  email: string;
}) {
  const token = await getToken();
  const base = siteUrl();

  const res = await fetch(`${api()}/api_redirect/v1/checkouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      amount_in_cents: args.total * 100,
      order_reference_id: args.orderId,
      phone_number: args.phone.replace(/\D/g, ""),
      email: args.email,
      success_url: `${base}/checkout/resultado?order=${args.orderId}`,
      failure_url: `${base}/checkout/resultado?order=${args.orderId}`,
      webhook_url: `${base}/api/webhooks/gocuotas`,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GO Cuotas checkout falló (${res.status})`);

  const data = (await res.json()) as { id?: string | number; url_init: string };
  return { id: data.id != null ? String(data.id) : null, url: data.url_init };
}

export function mapGoCuotasStatus(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
    case "paid":
    case "success":
      return "PAID";
    case "denied":
    case "rejected":
    case "failed":
      return "REJECTED";
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}
