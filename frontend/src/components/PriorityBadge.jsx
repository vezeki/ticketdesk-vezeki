const priorityMap = {
  BAIXA: { label: "Baixa", className: "bg-slate-100 text-slate-700" },
  MEDIA: { label: "Média", className: "bg-blue-100 text-blue-800" },
  ALTA: { label: "Alta", className: "bg-orange-100 text-orange-900" },
  CRITICA: { label: "Crítica", className: "bg-red-100 text-red-800" },
};

export function PriorityBadge({ priority }) {
  const p = priorityMap[priority] || { label: priority, className: "bg-slate-100" };
  return <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${p.className}`}>{p.label}</span>;
}
