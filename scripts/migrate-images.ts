import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

// tsx no carga .env solo: lo hacemos explícitamente (Node >= 20.12).
try {
  process.loadEnvFile();
} catch {
  /* .env opcional (en CI/producción las variables vienen del entorno) */
}

/**
 * Migra las fotos locales del repositorio a Cloudinary.
 *
 *  1) Sube public/uploads/* y actualiza en la base (DATABASE_URL) las URLs
 *     /uploads/xxx.png de ProductImage por la URL https de Cloudinary.
 *  2) Sube las fotos crudas de "Documentación/fotos ropa" y "Documentación/Logos"
 *     y muestra sus URLs para asignarlas a los productos desde el panel admin.
 *
 * Uso:  npm run images:migrate
 * (idempotente: ignora las imágenes que ya apuntan a http/https)
 */

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT = process.cwd();
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "barrio-street";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function upload(filePath: string, folder: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: folder ? `${FOLDER}/${folder}` : FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error(`Cloudinary falló para ${filePath}`));
        resolve(result);
      },
    );
  });
}

async function listImages(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    const files: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const info = await stat(full);
      if (info.isFile() && IMAGE_EXT.has(path.extname(entry).toLowerCase())) files.push(full);
    }
    return files;
  } catch {
    return [];
  }
}

async function migrateUploads() {
  const dir = path.join(ROOT, "public", "uploads");

  // Solo migramos las imágenes que la base todavía referencia como /uploads/*.
  const rows = await prisma.productImage.findMany({ where: { url: { startsWith: "/uploads/" } } });
  if (!rows.length) {
    console.log("[uploads] No hay imágenes /uploads/* pendientes en la base.");
    return;
  }

  const map = new Map<string, string>();
  for (const localUrl of new Set(rows.map((r) => r.url))) {
    const file = path.join(dir, path.basename(localUrl));
    try {
      await stat(file);
    } catch {
      console.warn(`[uploads] Falta el archivo ${file} (referenciado como ${localUrl}).`);
      continue;
    }
    const res = await upload(file, "catalogo");
    map.set(localUrl, res.secure_url);
    console.log(`[uploads] ${localUrl}  ->  ${res.secure_url}`);
  }

  let updated = 0;
  for (const row of rows) {
    const url = map.get(row.url);
    if (!url) continue;
    await prisma.productImage.update({ where: { id: row.id }, data: { url } });
    updated++;
  }
  console.log(`[uploads] ${updated}/${rows.length} referencias actualizadas en la base.`);
}

async function uploadDocumentacion() {
  const folders: [string, string][] = [
    ["Documentación/fotos ropa", "productos"],
    ["Documentación/Logos", "logos"],
  ];
  for (const [rel, folder] of folders) {
    const files = await listImages(path.join(ROOT, rel));
    if (!files.length) continue;
    console.log(`\n[${rel}] ${files.length} archivo(s):`);
    for (const file of files) {
      const res = await upload(file, folder);
      console.log(`  ${path.basename(file)}  ->  ${res.secure_url}`);
    }
  }
}

async function main() {
  if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Configurá CLOUDINARY_URL o CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET");
  }
  await migrateUploads();
  await uploadDocumentacion();
  console.log("\nListo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
