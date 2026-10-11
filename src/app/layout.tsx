import type { Metadata, Viewport } from "next";
import { Inter, Archivo, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Archivo({ subsets: ["latin"], variable: "--font-display", weight: ["600", "800", "900"] });
// Tipografía redondeada y pesada, la más cercana al logo "Barrio."
const logo = Poppins({ subsets: ["latin"], variable: "--font-logo", weight: ["700", "800"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BARRIO STREET | Tienda de ropa en Pergamino", template: "%s | BARRIO STREET" },
  description:
    "Tienda de ropa, industria nacional. Remeras, pantalones, abrigos, calzado y accesorios para hombre y mujer. Mitre 493, Pergamino. Pagá con Mercado Pago o GO Cuotas.",
  openGraph: { siteName: "BARRIO STREET", locale: "es_AR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#0B0B0B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${display.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
