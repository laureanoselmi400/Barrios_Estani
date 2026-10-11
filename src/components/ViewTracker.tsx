"use client";

import { useEffect } from "react";

/** Cuenta una visita por producto y por sesión de navegador. */
export default function ViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `bs-viewed-${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage bloqueado: se cuenta igual */
    }
    fetch(`/api/products/${productId}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [productId]);

  return null;
}
