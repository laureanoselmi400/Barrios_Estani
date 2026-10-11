import { PrismaClient } from "@prisma/client";

// tsx no carga .env solo (Node >= 20.12).
try {
  process.loadEnvFile();
} catch {
  /* env viene del entorno */
}

// Origen: Postgres local (Docker). Destino: DATABASE_URL del .env (Neon).
const LOCAL_URL =
  process.env.LOCAL_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/barriostreet?schema=public";

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const target = new PrismaClient();

async function main() {
  const products = await local.product.findMany({
    include: { images: true, sizes: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Copiando ${products.length} productos a Neon...`);

  for (const p of products) {
    await target.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        gender: p.gender,
        category: p.category,
        views: p.views,
        active: p.active,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        images: { create: p.images.map((i) => ({ id: i.id, url: i.url, position: i.position })) },
        sizes: { create: p.sizes.map((s) => ({ id: s.id, label: s.label })) },
      },
    });
  }
  console.log("Listo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await Promise.all([local.$disconnect(), target.$disconnect()]);
  });
