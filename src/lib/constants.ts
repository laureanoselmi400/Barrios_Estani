export const GENDERS = ["HOMBRE", "MUJER", "UNISEX"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABEL: Record<Gender, string> = {
  HOMBRE: "Hombre",
  MUJER: "Mujer",
  UNISEX: "Unisex",
};

export const CATEGORIES = [
  "REMERAS",
  "PANTALONES",
  "SACOS",
  "ABRIGOS",
  "CALZADO",
  "ACCESORIOS",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  REMERAS: "Remeras",
  PANTALONES: "Pantalones",
  SACOS: "Sacos",
  ABRIGOS: "Abrigos",
  CALZADO: "Calzado",
  ACCESORIOS: "Accesorios",
};

// Matriz de talles disponibles para elegir en el admin.
export const SIZE_OPTIONS = [
  "1",
  "2",
  "3",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "Único",
] as const;

export const sizeRank = (label: string) => {
  const i = SIZE_OPTIONS.indexOf(label as (typeof SIZE_OPTIONS)[number]);
  return i === -1 ? 999 : i;
};

export const SORT_OPTIONS = [
  { value: "vistos", label: "Más vistos" },
  { value: "nuevo", label: "Lo más nuevo" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
] as const;
export type Sort = (typeof SORT_OPTIONS)[number]["value"];

const ADDRESS_FULL = "Mitre 493, Pergamino, Buenos Aires, Argentina";

export const SITE = {
  name: "BARRIO STREET",
  tagline: "Tienda de ropa · Industria nacional",
  instagram: "barriostreet.co",
  instagramUrl: "https://www.instagram.com/barriostreet.co/",
  phoneDisplay: "+54 9 2477 698738",
  phoneE164: "+5492477698738",
  address: "Mitre 493, Pergamino, Buenos Aires",
  addressFull: ADDRESS_FULL,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS_FULL)}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS_FULL)}&output=embed`,
  // Horarios publicados en el Instagram del local
  hoursList: [
    { days: "Lunes a Jueves", time: "9:30 a 12:30 · 17:00 a 20:00" },
    { days: "Viernes y Sábados", time: "10:00 a 13:00 · 17:00 a 20:30" },
    { days: "Domingo", time: "Cerrado" },
  ],
};
