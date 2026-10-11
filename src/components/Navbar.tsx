"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import clsx from "clsx";
import { selectCount, useCart } from "@/store/cart";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/nosotros", label: "Sobre Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCart(selectCount);
  const setOpen = useCart((s) => s.setOpen);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenu(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-paper backdrop-blur">
      <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center sm:h-[72px]">
        <div className="flex items-center">
          <button
            className="-ml-2 p-2 md:hidden"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Principal">
            {LINKS.slice(0, 2).map((l) => (
              <NavLink key={l.href} {...l} active={isActive(l.href)} />
            ))}
          </nav>
        </div>

        {/* Logo centrado */}
        <Link href="/" aria-label="Barrio — inicio">
          <Logo size="md" />
        </Link>

        <div className="flex items-center justify-end gap-7">
          <nav className="hidden items-center gap-7 md:flex" aria-label="Secundario">
            {LINKS.slice(2).map((l) => (
              <NavLink key={l.href} {...l} active={isActive(l.href)} />
            ))}
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="relative -mr-2 p-2"
            aria-label={`Abrir carrito${mounted && count ? ` (${count} productos)` : ""}`}
          >
            <ShoppingBag size={22} />
            {mounted && count > 0 && (
              <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav
        className={clsx(
          "grid border-t border-white/10 bg-ink transition-all duration-300 md:hidden",
          menu ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-t-0 opacity-0",
        )}
        aria-label="Móvil"
      >
        <div className="overflow-hidden">
          <ul className="container-x py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={clsx(
                    "block border-b border-white/10 py-3.5 text-sm font-semibold uppercase tracking-street",
                    isActive(l.href) ? "text-brand" : "text-concrete-300",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "text-[11px] font-semibold uppercase tracking-street transition-colors hover:text-brand",
        active ? "text-brand" : "text-concrete-300",
      )}
    >
      {label}
    </Link>
  );
}
