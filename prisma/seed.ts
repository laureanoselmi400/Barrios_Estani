import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (seed: string, n = 3) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/1000`);

const products = [
  {
    title: "Remera Oversize Barrio",
    slug: "remera-oversize-barrio",
    description:
      "Remera oversize de algodón peinado 24/1, 100% algodón.\nCalce: holgado, hombros caídos.\nCuidados: lavar del revés en agua fría, no usar secadora.",
    price: 28000,
    salePrice: 22900,
    gender: "UNISEX",
    category: "REMERAS",
    views: 120,
    sizes: ["1", "2", "3"],
  },
  {
    title: "Cargo Baggy Negro",
    slug: "cargo-baggy-negro",
    description:
      "Pantalón cargo de gabardina con bolsillos laterales.\nCalce: baggy, tiro medio.\nCuidados: lavado a máquina en ciclo suave.",
    price: 65000,
    salePrice: null,
    gender: "HOMBRE",
    category: "PANTALONES",
    views: 98,
    sizes: ["38", "40", "42", "44"],
  },
  {
    title: "Campera Puffer Urbana",
    slug: "campera-puffer-urbana",
    description:
      "Abrigo acolchado con relleno térmico, capucha desmontable.\nCalce: regular.\nCuidados: lavar a mano, secar a la sombra.",
    price: 120000,
    salePrice: 99000,
    gender: "MUJER",
    category: "ABRIGOS",
    views: 77,
    sizes: ["S", "M", "L"],
  },
  {
    title: "Saco Boxy Wool",
    slug: "saco-boxy-wool",
    description:
      "Saco de paño mezcla lana con corte boxy.\nCalce: cuadrado, largo medio.\nCuidados: limpieza en seco.",
    price: 95000,
    salePrice: null,
    gender: "UNISEX",
    category: "SACOS",
    views: 45,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    title: "Zapatillas Street Low",
    slug: "zapatillas-street-low",
    description:
      "Zapatillas de cuero sintético con suela vulcanizada.\nCuidados: limpiar con paño húmedo.",
    price: 85000,
    salePrice: 72000,
    gender: "UNISEX",
    category: "CALZADO",
    views: 60,
    sizes: ["38", "39", "40", "41", "42", "43"],
  },
  {
    title: "Gorra Trucker Barrio",
    slug: "gorra-trucker-barrio",
    description: "Gorra trucker con logo bordado y cierre ajustable.",
    price: 18000,
    salePrice: null,
    gender: "UNISEX",
    category: "ACCESORIOS",
    views: 30,
    sizes: ["Único"],
  },
];

async function main() {
  for (const { sizes, ...p } of products) {
    const images = img(p.slug);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        images: { create: images.map((url, position) => ({ url, position })) },
        sizes: { create: sizes.map((label) => ({ label })) },
      },
    });
  }
  console.log(`Seed OK: ${products.length} productos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
