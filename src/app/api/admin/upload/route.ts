import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { requireAdmin } from "@/lib/auth";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 6 * 1024 * 1024;
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "barrio-street";

// El SDK toma CLOUDINARY_URL automáticamente si está definida; si no, usa estas.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function uploadBuffer(buffer: Buffer, format: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: FOLDER, resource_type: "image", format, overwrite: false }, (err, result) => {
        if (err || !result) return reject(err ?? new Error("Cloudinary no devolvió resultado"));
        resolve(result);
      })
      .end(buffer);
  });
}

/**
 * Sube imágenes a Cloudinary y devuelve sus URLs https (contrato { urls }).
 * En Vercel el disco es de solo lectura, por eso no se guarda nada en /public.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: "Cloudinary no está configurado" }, { status: 500 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "Sin archivos" }, { status: 400 });

  const urls: string[] = [];
  try {
    for (const file of files) {
      const ext = ALLOWED[file.type];
      if (!ext) return NextResponse.json({ error: `Formato no permitido: ${file.type}` }, { status: 400 });
      if (file.size > MAX_BYTES) return NextResponse.json({ error: "Máximo 6 MB por imagen" }, { status: 400 });

      const result = await uploadBuffer(Buffer.from(await file.arrayBuffer()), ext);
      urls.push(result.secure_url);
    }
  } catch (err) {
    console.error("[upload cloudinary]", err);
    return NextResponse.json({ error: "No se pudieron subir las imágenes" }, { status: 502 });
  }

  return NextResponse.json({ urls });
}
