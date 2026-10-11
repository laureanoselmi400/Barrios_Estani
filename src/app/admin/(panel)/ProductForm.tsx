"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Plus, Trash2, Upload } from "lucide-react";
import clsx from "clsx";
import { CATEGORIES, CATEGORY_LABEL, GENDERS, GENDER_LABEL, SIZE_OPTIONS } from "@/lib/constants";
import { saveProduct } from "../actions";

type FormState = {
  title: string;
  description: string;
  price: string;
  salePrice: string;
  gender: string;
  category: string;
  sizes: string[];
  images: string[];
  active: boolean;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  price: "",
  salePrice: "",
  gender: "UNISEX",
  category: "REMERAS",
  sizes: [],
  images: [],
  active: true,
};

export default function ProductForm({ id, initial }: { id?: string; initial?: FormState }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(initial ?? EMPTY);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const toggleSize = (s: string) =>
    set("sizes", f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= f.images.length) return;
    const next = [...f.images];
    [next[i], next[j]] = [next[j], next[i]];
    set("images", next);
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      Array.from(files).forEach((file) => body.append("files", file));
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir");
      set("images", [...f.images, ...data.urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!/^https?:\/\//i.test(u)) return setError("La URL debe empezar con http:// o https://");
    setError(null);
    set("images", [...f.images, u]);
    setUrlInput("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await saveProduct(id ?? null, f as never);
      if (!res.ok) return setError(res.error);
      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6 border border-concrete-200 bg-white p-6">
        <div>
          <label htmlFor="title" className="label">Título / nombre</label>
          <input id="title" required value={f.title} onChange={(e) => set("title", e.target.value)} className="input" />
        </div>

        <div>
          <label htmlFor="desc" className="label">Descripción (materiales, calce, cuidados)</label>
          <textarea id="desc" required rows={7} value={f.description} onChange={(e) => set("description", e.target.value)} className="input resize-y" placeholder={"Materiales: …\nCalce: …\nCuidados: …"} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="label">Precio original (ARS)</label>
            <input id="price" type="number" min={1} required value={f.price} onChange={(e) => set("price", e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="sale" className="label">Precio promocional (opcional)</label>
            <input id="sale" type="number" min={1} value={f.salePrice} onChange={(e) => set("salePrice", e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="gender" className="label">Género</label>
            <select id="gender" value={f.gender} onChange={(e) => set("gender", e.target.value)} className="input">
              {GENDERS.map((g) => <option key={g} value={g}>{GENDER_LABEL[g]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cat" className="label">Rubro</label>
            <select id="cat" value={f.category} onChange={(e) => set("category", e.target.value)} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="label">Talles disponibles</legend>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => (
              <button
                type="button"
                key={s}
                aria-pressed={f.sizes.includes(s)}
                onClick={() => toggleSize(s)}
                className={clsx("min-w-[2.75rem] border px-3 py-1.5 text-xs font-medium transition-colors", f.sizes.includes(s) ? "border-ink bg-ink text-paper" : "border-concrete-300 hover:border-ink")}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="space-y-6">
        <div className="border border-concrete-200 bg-white p-6">
          <h2 className="label">Galería de imágenes</h2>
          <p className="mb-3 text-[11px] text-concrete-500">La primera es la portada. Reordená con las flechas.</p>

          <ul className="grid grid-cols-3 gap-2">
            {f.images.map((url, i) => (
              <li key={url + i} className="group relative aspect-[4/5] bg-concrete-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase text-paper">Portada</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 p-1 text-paper opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Mover antes"><ArrowLeft size={14} /></button>
                  <button type="button" onClick={() => set("images", f.images.filter((_, k) => k !== i))} aria-label="Quitar imagen"><Trash2 size={14} /></button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Mover después"><ArrowRight size={14} /></button>
                </div>
              </li>
            ))}
          </ul>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline mt-3 w-full !py-2.5">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Subir imágenes
          </button>

          <div className="mt-3 flex gap-2">
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="o pegá una URL de imagen" className="input" aria-label="URL de imagen" />
            <button type="button" onClick={addUrl} aria-label="Agregar URL" className="border border-ink px-3 hover:bg-ink hover:text-paper"><Plus size={16} /></button>
          </div>
        </div>

        <div className="border border-concrete-200 bg-white p-6">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-ink" />
            Visible en la tienda
          </label>
        </div>

        {error && <p role="alert" className="bg-alert/10 p-3 text-xs text-alert">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin")} className="btn-outline flex-1">Cancelar</button>
          <button type="submit" disabled={pending || uploading} className="btn-primary flex-1">
            {pending ? <Loader2 size={14} className="animate-spin" /> : id ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </form>
  );
}
