import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "bs_admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let ok = false;
  if (token && process.env.AUTH_SECRET) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      ok = payload.role === "admin";
    } catch {
      ok = false;
    }
  }

  if (!ok) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
