const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatPrice = (n: number) => ars.format(n);

export const effectivePrice = (p: { price: number; salePrice: number | null }) =>
  p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;

export const discountPct = (p: { price: number; salePrice: number | null }) =>
  p.salePrice != null && p.salePrice < p.price
    ? Math.round(((p.price - p.salePrice) / p.price) * 100)
    : 0;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
