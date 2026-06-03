import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertTriangle, Filter, Kanban } from "lucide-react";
import { addComment, fetchTickets, finalizeTicket, updateTicket } from "../../services/ticket.service.js";
import { PriorityBadge } from "../../components/PriorityBadge.jsx";
import { SlaBadge } from "../../components/SlaBadge.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { TicketTimeInfo } from "../../components/TicketTimeInfo.jsx";
import { technicianLabel } from "../../constants/ticketMeta.js";
import { sortBySlaUrgency } from "../../utils/ticketTime.js";

const MOVE_COLUMNS = [
  { status: "ABERTO", title: "Aberto", tint: "from-sky-50 to-white border-sky-200", dot: "bg-sky-500" },
  { status: "EM_ANDAMENTO", title: "Em andamento", tint: "from-amber-50 to-white border-amber-200", dot: "bg-amber-500" },
  { status: "AGUARDANDO", title: "Aguardando", tint: "from-violet-50 to-white border-violet-200", dot: "bg-violet-500" },
];

export default function TiBoard() {
  const qc = useQueryClient();
  const [err, setErr] = useState("");
  const [filterCrit, setFilterCrit] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", "board"],
    queryFn: () => fetchTickets({ limit: 200 }),
  });

  const { data: doneData } = useQuery({
    queryKey: ["tickets", "board-done"],
    queryFn: () => fetchTickets({ limit: 15, status: "RESOLVIDO" }),
  });

  const tickets = data?.data || [];
  const doneTickets = doneData?.data || [];

  const byStatus = useMemo(() => {
    const m = { ABERTO: [], EM_ANDAMENTO: [], AGUARDANDO: [] };
    for (const t of tickets) {
      if (m[t.status]) m[t.status].push(t);
    }
    for (const key of Object.keys(m)) {
      let list = sortBySlaUrgency(m[key]);
      if (filterCrit) list = list.filter((t) => t.priority === "CRITICA");
      m[key] = list;
    }
    return m;
  }, [tickets, filterCrit]);

  const counts = useMemo(() => {
    const c = { open: 0, crit: 0, overdue: 0 };
    for (const t of tickets) {
      if (t.status === "RESOLVIDO" || t.status === "CANCELADO") continue;
      c.open += 1;
      if (t.priority === "CRITICA") c.crit += 1;
    }
    return c;
  }, [tickets]);

  const [dragId, setDragId] = useState(null);
  const [finalizeId, setFinalizeId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [commentModal, setCommentModal] = useState(null);
  const [quickMsg, setQuickMsg] = useState("");

  const mutMove = useMutation({
    mutationFn: ({ id, status }) => updateTicket(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      setDragId(null);
      setErr("");
    },
    onError: (e) => setErr(e.response?.data?.error || "Não foi possível mover o card"),
  });

  const mutFinalize = useMutation({
    mutationFn: ({ id, note }) => finalizeTicket(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      setFinalizeId(null);
      setResolutionNote("");
      setErr("");
    },
    onError: (e) => setErr(e.response?.data?.error || "Não foi possível finalizar"),
  });

  const mutComment = useMutation({
    mutationFn: ({ id, message }) => addComment(id, { message, isInternal: false }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tickets"] });
      qc.invalidateQueries({ queryKey: ["comments", vars.id] });
      setCommentModal(null);
      setQuickMsg("");
    },
  });

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDropColumn(e, status) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!raw) return;
    let id;
    try {
      const p = JSON.parse(raw);
      id = p.id;
    } catch {
      id = raw;
    }
    const ticket = tickets.find((x) => x.id === id);
    if (!ticket || ticket.status === status) return;
    if (ticket.status === "RESOLVIDO" || ticket.status === "CANCELADO") return;
    mutMove.mutate({ id: ticket.id, status });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-200/80">
              <Kanban className="h-4 w-4" />
              Operação TI
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Quadro TI</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100/90">
              Cards ordenados por urgência de SLA. Arraste entre colunas ou finalize com comentário obrigatório.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterCrit((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
                filterCrit
                  ? "bg-rose-500/30 text-white ring-rose-300/50"
                  : "bg-white/10 text-white ring-white/30 hover:bg-white/15"
              }`}
            >
              <Filter className="h-4 w-4" />
              {filterCrit ? "Só críticos" : "Todos"}
            </button>
            <Link
              to="/tickets"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/15"
            >
              Lista com filtros
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-xs uppercase tracking-wide text-white/70">Em aberto</p>
            <p className="mt-1 text-3xl font-bold">{counts.open}</p>
          </div>
          <div className="rounded-2xl bg-rose-500/20 p-4 ring-1 ring-rose-200/30">
            <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-rose-100">
              <AlertTriangle className="h-3.5 w-3.5" />
              Críticos
            </p>
            <p className="mt-1 text-3xl font-bold text-rose-50">{counts.crit}</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/15 p-4 ring-1 ring-emerald-200/20">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Dica</p>
            <p className="mt-1 text-sm text-emerald-50">Priorize cards com SLA vermelho ou âmbar no topo.</p>
          </div>
        </div>
      </div>

      {(err || error) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err || "Erro ao carregar o quadro."}
        </div>
      )}

      {finalizeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              mutFinalize.mutate({ id: finalizeId, note: resolutionNote.trim() });
            }}
          >
            <h2 className="text-lg font-bold text-slate-900">Finalizar chamado</h2>
            <textarea
              required
              minLength={5}
              rows={4}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Comentário de finalização…"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Confirmar
              </button>
              <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={() => setFinalizeId(null)}>
                Fechar
              </button>
            </div>
          </form>
        </div>
      )}

      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Comentário rápido</h2>
            <p className="mt-1 truncate text-sm text-slate-500">{commentModal.title}</p>
            <textarea
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              value={quickMsg}
              onChange={(e) => setQuickMsg(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  if (!quickMsg.trim()) return;
                  mutComment.mutate({ id: commentModal.id, message: quickMsg.trim() });
                }}
              >
                Enviar
              </button>
              <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={() => setCommentModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <p className="text-slate-600">Carregando quadro…</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {MOVE_COLUMNS.map((col) => (
          <div
            key={col.status}
            className={`flex min-h-[480px] w-[min(100%,360px)] flex-shrink-0 flex-col rounded-2xl border-2 bg-gradient-to-b p-4 ${col.tint}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDropColumn(e, col.status)}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                {col.title}
              </h2>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-sm">
                {byStatus[col.status]?.length || 0}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
              {(byStatus[col.status] || []).map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    const payload = JSON.stringify({ id: t.id });
                    e.dataTransfer.setData("application/json", payload);
                    e.dataTransfer.setData("text/plain", t.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDragId(t.id);
                  }}
                  onDragEnd={() => setDragId(null)}
                  className={`rounded-xl border border-slate-200/90 bg-white p-4 shadow-md transition ${
                    dragId === t.id ? "opacity-60 ring-2 ring-sky-400" : "hover:shadow-lg"
                  } ${t.priority === "CRITICA" ? "border-l-4 border-l-rose-500" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link draggable={false} to={`/tickets/${t.id}`} className="font-semibold text-slate-900 hover:text-sky-800">
                      {t.title}
                    </Link>
                  </div>
                  <TicketTimeInfo ticket={t} showSla className="mt-2" />
                  <div className="mt-2 flex flex-wrap gap-1">
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    {t.slaLevel && <SlaBadge level={t.slaLevel} />}
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    <span className="font-medium">{technicianLabel(t.technicianKey)}</span>
                    {t.establishment ? ` · ${t.establishment}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{t.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      onClick={() => {
                        setResolutionNote("");
                        setFinalizeId(t.id);
                      }}
                    >
                      Finalizar
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setCommentModal({ id: t.id, title: t.title })}
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Últimos finalizados</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {doneTickets.length === 0 && <li className="py-3 text-sm text-slate-500">Nenhum ainda.</li>}
          {doneTickets.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <Link className="font-medium text-sky-800 hover:underline" to={`/tickets/${t.id}`}>
                {t.title}
              </Link>
              <span className="text-xs text-slate-500">{new Date(t.resolvedAt || t.updatedAt).toLocaleString("pt-BR")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
