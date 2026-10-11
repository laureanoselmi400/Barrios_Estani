import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Segunda barrera además del middleware
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-concrete-50">
      <header className="border-b border-concrete-200 bg-paper">
        <div className="container-x flex h-14 items-center justify-between">
          <Link href="/admin" className="font-display text-sm font-black uppercase tracking-[0.22em]">
            Barrio Street <span className="ml-2 text-concrete-400">Admin</span>
          </Link>
          <div className="flex items-center gap-5 text-[11px] font-semibold uppercase tracking-street">
            <Link href="/" target="_blank" className="text-concrete-500 hover:text-ink">Ver sitio</Link>
            <form action={logoutAction}>
              <button className="flex items-center gap-1.5 text-concrete-500 hover:text-ink"><LogOut size={14} /> Salir</button>
            </form>
          </div>
        </div>
      </header>
      <div className="container-x py-8">{children}</div>
    </div>
  );
}
