import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-2xl font-black uppercase tracking-[0.22em]">Barrio Street</p>
        <p className="mb-8 mt-1 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-concrete-500">Panel admin</p>
        <LoginForm />
      </div>
    </div>
  );
}
