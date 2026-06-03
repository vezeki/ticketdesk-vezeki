const statusMap = {
  ABERTO: { label: "Aberto", className: "bg-sky-100 text-sky-800" },
  EM_ANDAMENTO: { label: "Em andamento", className: "bg-amber-100 text-amber-900" },
  AGUARDANDO: { label: "Aguardando", className: "bg-violet-100 text-violet-800" },
  RESOLVIDO: { label: "Resolvido", className: "bg-emerald-100 text-emerald-800" },
  CANCELADO: { label: "Cancelado", className: "bg-slate-200 text-slate-700" },
};

export function StatusBadge({ status }) {
  const s = statusMap[status] || { label: status, className: "bg-slate-100 text-slate-700" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>;
}
