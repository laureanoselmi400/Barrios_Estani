import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "bs_admin";
const MAX_AGE = 60 * 60 * 8; // 8 horas

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Falta AUTH_SECRET en las variables de entorno");
  return new TextEncoder().encode(s);
};

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

export function checkCredentials(email: string, password: string) {
  const okEmail = safeEqual(email.trim().toLowerCase(), (process.env.ADMIN_EMAIL ?? "").toLowerCase());
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD ?? "");
  return okEmail && okPass && !!process.env.ADMIN_PASSWORD;
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Defensa en profundidad: usar al inicio de cada server action / route handler del admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}
