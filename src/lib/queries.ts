import { prisma } from "@/lib/prisma";
import { effectivePrice } from "@/lib/format";
import { sizeRank, type Sort } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const include = {
  images: { orderBy: { position: "asc" as const } },
  sizes: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof include }>;

const withSortedSizes = (p: ProductWithRelations): ProductWithRelations => ({
  ...p,
  sizes: [...p.sizes].sort((a, b) => sizeRank(a.label) - sizeRank(b.label)),
});

export type CatalogFilters = {
  gender?: string;
  category?: string;
  size?: string;
  q?: string;
  min?: number;
  max?: number;
  sort?: Sort;
};

export async function getProducts(f: CatalogFilters = {}) {
  const and: Prisma.ProductWhereInput[] = [{ active: true }];

  if (f.gender) and.push({ gender: f.gender });
  if (f.category) and.push({ category: f.category });
  if (f.size) and.push({ sizes: { some: { label: f.size } } });
  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { description: { contains: f.q, mode: "insensitive" } },
      ],
    });
  }
  // El rango se evalúa sobre el precio efectivo (promo si existe, si no el original)
  const range = { ...(f.min != null && { gte: f.min }), ...(f.max != null && { lte: f.max }) };
  if (f.min != null || f.max != null) {
    and.push({
      OR: [{ salePrice: range }, { salePrice: null, price: range }],
    });
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    f.sort === "nuevo" ? { createdAt: "desc" } : { views: "desc" };

  const rows = await prisma.product.findMany({ where: { AND: and }, include, orderBy });
  let list = rows.map(withSortedSizes);

  if (f.sort === "precio-asc") list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (f.sort === "precio-desc") list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  return list;
}

/** Destacados = los de mayor contador de visualizaciones. */
export async function getFeaturedProducts(take = 8) {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include,
    orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    take,
  });
  return rows.map(withSortedSizes);
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findFirst({ where: { slug, active: true }, include });
  return p ? withSortedSizes(p) : null;
}

export async function getProductById(id: string) {
  const p = await prisma.product.findUnique({ where: { id }, include });
  return p ? withSortedSizes(p) : null;
}

export async function getAllProductsAdmin() {
  return prisma.product.findMany({ include, orderBy: { createdAt: "desc" } });
}

export async function getAvailableSizes() {
  const rows = await prisma.productSize.findMany({ distinct: ["label"], select: { label: true } });
  return rows.map((r) => r.label).sort((a, b) => sizeRank(a) - sizeRank(b));
}
