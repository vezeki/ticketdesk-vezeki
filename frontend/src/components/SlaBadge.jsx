const slaMap = {
  ATE_120H: { label: "SLA 120h", className: "bg-slate-100 text-slate-700" },
  ATE_72H: { label: "SLA 72h", className: "bg-slate-100 text-slate-700" },
  ATE_48H: { label: "SLA 48h", className: "bg-cyan-100 text-cyan-900" },
  ATE_24H: { label: "SLA 24h", className: "bg-sky-100 text-sky-900" },
  ATE_8H: { label: "SLA 8h", className: "bg-amber-100 text-amber-900" },
  ATE_4H: { label: "SLA 4h", className: "bg-rose-100 text-rose-900" },
};

export function slaLabel(level) {
  return slaMap[level]?.label || level;
}

export function SlaBadge({ level }) {
  const s = slaMap[level] || { label: level, className: "bg-slate-100 text-slate-600" };
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${s.className}`}>{s.label}</span>;
}

export const SLA_OPTIONS = [
  { value: "ATE_120H", label: "Até 120 horas" },
  { value: "ATE_72H", label: "Até 72 horas" },
  { value: "ATE_48H", label: "Até 48 horas" },
  { value: "ATE_24H", label: "Até 24 horas" },
  { value: "ATE_8H", label: "Até 8 horas" },
  { value: "ATE_4H", label: "Até 4 horas" },
];
