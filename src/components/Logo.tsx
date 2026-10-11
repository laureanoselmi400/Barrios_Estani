import clsx from "clsx";

const SIZES = {
  sm: { word: "text-2xl", sub: "text-[5px] tracking-[0.3em]" },
  md: { word: "text-3xl sm:text-[2rem]", sub: "text-[6px] tracking-[0.34em]" },
  xl: { word: "text-[22vw] sm:text-[16rem]", sub: "text-[2.4vw] sm:text-xl tracking-[0.4em]" },
} as const;

/**
 * Logo "Barrio." recreado en tipografía (amarillo sobre negro).
 * Para usar el archivo original: guardar el PNG/SVG en /public/logo.png y
 * reemplazar el contenido de este componente por un <img src="/logo.png" />.
 */
export default function Logo({ size = "md", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={clsx("inline-flex flex-col items-center leading-none text-brand", className)}>
      <span className={clsx("font-logo font-extrabold tracking-[-0.045em]", s.word)}>Barrio.</span>
      <span className={clsx("mt-1 font-sans font-semibold uppercase text-brand/80", s.sub)}>Tienda de ropa</span>
    </span>
  );
}
