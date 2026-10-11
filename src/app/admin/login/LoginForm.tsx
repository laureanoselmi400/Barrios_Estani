"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4 border border-concrete-200 bg-white p-6">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {state?.error && <p role="alert" className="text-xs text-alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? <Loader2 size={16} className="animate-spin" /> : "Ingresar"}
      </button>
    </form>
  );
}
