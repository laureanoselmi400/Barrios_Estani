"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { CATEGORIES, GENDERS, SIZE_OPTIONS } from "@/lib/constants";
import { slugify } from "@/lib/format";

/* ---------- Sesión ---------- */

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const usuario = String(formData.get("usuario") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(usuario, password)) {
    await new Promise((r) => setTimeout(r, 700)); // frena fuerza bruta básica
    return { error: "Credenciales incorrectas" };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Productos ---------- */

const productSchema = z
  .object({
    title: z.string().trim().min(2, "Ingresá un título").max(120),
    description: z.string().trim().min(10, "La descripción es muy corta").max(4000),
    price: z.coerce.number().int().min(1, "Precio inválido"),
    salePrice: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.coerce.number().int().min(1).nullable(),
    ),
    gender: z.enum(GENDERS),
    category: z.enum(CATEGORIES),
    sizes: z.array(z.enum(SIZE_OPTIONS)).min(1, "Elegí al menos un talle"),
    images: z.array(z.string().min(1)).min(1, "Agregá al menos una imagen").max(12),
    active: z.boolean(),
  })
  .refine((d) => d.salePrice == null || d.salePrice < d.price, {
    message: "El precio promocional debe ser menor al original",
    path: ["salePrice"],
  });

export type ProductInput = z.input<typeof productSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

async function uniqueSlug(title: string, ignoreId?: string) {
  const base = slugify(title) || "producto";
  let slug = base;
  for (let n = 2; ; n++) {
    const found = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${base}-${n}`;
  }
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const base = {
    title: d.title,
    description: d.description,
    price: d.price,
    salePrice: d.salePrice,
    gender: d.gender,
    category: d.category,
    active: d.active,
  };

  if (id) {
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productSize.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...base,
          slug: await uniqueSlug(d.title, id),
          images: { create: d.images.map((url, position) => ({ url, position })) },
          sizes: { create: d.sizes.map((label) => ({ label })) },
        },
      }),
    ]);
  } else {
    await prisma.product.create({
      data: {
        ...base,
        slug: await uniqueSlug(d.title),
        images: { create: d.images.map((url, position) => ({ url, position })) },
        sizes: { create: d.sizes.map((label) => ({ label })) },
      },
    });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function toggleActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
}
