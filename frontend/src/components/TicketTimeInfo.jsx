import { Clock, AlertTriangle, Timer } from "lucide-react";
import { formatDuration, getElapsedMs, getSlaStatus, isOpenStatus } from "../utils/ticketTime.js";

const slaTone = {
  overdue: "bg-rose-50 text-rose-800 ring-rose-200",
  urgent: "bg-amber-50 text-amber-900 ring-amber-200",
  ok: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  unknown: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function ElapsedTime({ createdAt, status, className = "" }) {
  if (!createdAt || !isOpenStatus(status)) return null;
  const elapsed = formatDuration(getElapsedMs(createdAt));
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-slate-200 bg-slate-50 text-slate-700 ${className}`}
      title="Tempo desde a abertura"
    >
      <Clock className="h-3 w-3 shrink-0" />
      Aberto há {elapsed}
    </span>
  );
}

export function SlaTimeInfo({ createdAt, slaLevel, status, className = "" }) {
  if (!slaLevel || !isOpenStatus(status)) return null;
  const sla = getSlaStatus(createdAt, slaLevel, status);
  const Icon = sla.state === "overdue" ? AlertTriangle : Timer;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ${slaTone[sla.state] || slaTone.unknown} ${className}`}
      title="Prazo SLA (prioridade)"
    >
      <Icon className="h-3 w-3 shrink-0" />
      {sla.label}
    </span>
  );
}

export function TicketTimeInfo({ ticket, showSla = false, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <ElapsedTime createdAt={ticket.createdAt} status={ticket.status} />
      {showSla && <SlaTimeInfo createdAt={ticket.createdAt} slaLevel={ticket.slaLevel} status={ticket.status} />}
    </div>
  );
}
