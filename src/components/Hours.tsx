import { SITE } from "@/lib/constants";

export default function Hours({ className }: { className?: string }) {
  return (
    <dl className={className}>
      {SITE.hoursList.map((h) => (
        <div key={h.days} className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 border-b border-current/15 py-2.5 text-sm last:border-0">
          <dt className="font-semibold">{h.days}</dt>
          <dd className="opacity-80">{h.time}</dd>
        </div>
      ))}
    </dl>
  );
}
