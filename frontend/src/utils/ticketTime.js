const SLA_HOURS = {
  ATE_120H: 120,
  ATE_72H: 72,
  ATE_48H: 48,
  ATE_24H: 24,
  ATE_8H: 8,
  ATE_4H: 4,
};

const OPEN_STATUSES = ["ABERTO", "EM_ANDAMENTO", "AGUARDANDO"];

export function isOpenStatus(status) {
  return OPEN_STATUSES.includes(status);
}

export function getSlaHours(slaLevel) {
  return SLA_HOURS[slaLevel] ?? 48;
}

export function getElapsedMs(createdAt) {
  if (!createdAt) return 0;
  return Math.max(0, Date.now() - new Date(createdAt).getTime());
}

export function getSlaDeadline(createdAt, slaLevel) {
  const hours = getSlaHours(slaLevel);
  return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000);
}

export function getSlaRemainingMs(createdAt, slaLevel) {
  if (!createdAt || !slaLevel) return null;
  return getSlaDeadline(createdAt, slaLevel).getTime() - Date.now();
}

export function formatDuration(ms) {
  if (ms == null || ms < 0) ms = 0;
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function getSlaStatus(createdAt, slaLevel, status) {
  if (!isOpenStatus(status)) return { state: "closed", label: "Encerrado" };

  const remaining = getSlaRemainingMs(createdAt, slaLevel);
  if (remaining == null) return { state: "unknown", label: "—" };

  if (remaining <= 0) {
    return { state: "overdue", label: `Atrasado ${formatDuration(-remaining)}`, remaining };
  }
  if (remaining <= 4 * 60 * 60 * 1000) {
    return { state: "urgent", label: `Restam ${formatDuration(remaining)}`, remaining };
  }
  return { state: "ok", label: `Restam ${formatDuration(remaining)}`, remaining };
}

export function sortBySlaUrgency(tickets) {
  return [...tickets].sort((a, b) => {
    const ra = getSlaRemainingMs(a.createdAt, a.slaLevel) ?? Infinity;
    const rb = getSlaRemainingMs(b.createdAt, b.slaLevel) ?? Infinity;
    if (ra !== rb) return ra - rb;
    if (a.priority === "CRITICA" && b.priority !== "CRITICA") return -1;
    if (b.priority === "CRITICA" && a.priority !== "CRITICA") return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}
