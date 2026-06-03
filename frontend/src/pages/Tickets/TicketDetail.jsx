import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  addComment,
  assignTicket,
  downloadTicketAttachment,
  fetchComments,
  fetchTicket,
  finalizeTicket,
  updateTicket,
} from "../../services/ticket.service.js";
import { fetchUsers } from "../../services/user.service.js";
import { CommentList } from "../../components/CommentList.jsx";
import { PriorityBadge } from "../../components/PriorityBadge.jsx";
import { SLA_OPTIONS, SlaBadge } from "../../components/SlaBadge.jsx";
import { StatusBadge } from "../../components/StatusBadge.jsx";
import { TicketTimeInfo } from "../../components/TicketTimeInfo.jsx";
import { isOpenStatus } from "../../utils/ticketTime.js";
import { TECHNICIANS, technicianLabel } from "../../constants/ticketMeta.js";

const openStatuses = ["ABERTO", "EM_ANDAMENTO", "AGUARDANDO"];
const priorities = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("pt-BR");
}

export default function TicketDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { isAdmin, isTech } = useAuth();
  const [comment, setComment] = useState("");
  const [internal, setInternal] = useState(false);
  const [assignId, setAssignId] = useState("");
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [panelError, setPanelError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState("");

  const ticketQ = useQuery({ queryKey: ["ticket", id], queryFn: () => fetchTicket(id) });
  const commentsQ = useQuery({ queryKey: ["comments", id], queryFn: () => fetchComments(id) });
  const usersQ = useQuery({
    queryKey: ["users", "assign"],
    queryFn: () => fetchUsers({ limit: 100 }),
    enabled: isAdmin,
  });

  const t = ticketQ.data;
  useEffect(() => {
    if (t?.assignedToId) setAssignId(t.assignedToId);
    else setAssignId("");
  }, [t?.assignedToId]);

  const techOptions =
    usersQ.data?.data?.filter((u) => (u.role === "TECNICO" || u.role === "ADMIN") && u.active) || [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ticket", id] });
    qc.invalidateQueries({ queryKey: ["comments", id] });
    qc.invalidateQueries({ queryKey: ["tickets"] });
  };

  const mutComment = useMutation({
    mutationFn: () => addComment(id, { message: comment, isInternal: internal && isTech }),
    onSuccess: () => {
      setComment("");
      setInternal(false);
      invalidate();
    },
  });

  const mutUpdate = useMutation({
    mutationFn: (body) => updateTicket(id, body),
    onSuccess: () => {
      invalidate();
      setPanelError("");
    },
    onError: (err) => {
      setPanelError(err.response?.data?.error || "Não foi possível atualizar");
    },
  });

  const mutFinalize = useMutation({
    mutationFn: (note) => finalizeTicket(id, note),
    onSuccess: () => {
      setFinalizeOpen(false);
      setResolutionNote("");
      setPanelError("");
      invalidate();
    },
    onError: (err) => {
      setPanelError(err.response?.data?.error || "Não foi possível finalizar");
    },
  });

  const mutAssign = useMutation({
    mutationFn: () => assignTicket(id, assignId || null),
    onSuccess: () => {
      invalidate();
    },
  });

  if (ticketQ.isLoading) return <p className="text-slate-600">Carregando…</p>;
  if (ticketQ.error || !t) {
    return (
      <p className="text-red-600">
        Chamado não encontrado ou sem permissão. <Link to="/tickets">Voltar</Link>
      </p>
    );
  }

  const canFinalize = isTech && t.status !== "RESOLVIDO" && t.status !== "CANCELADO";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link to="/tickets" className="text-sm font-medium text-sky-700 hover:underline">
        ← Voltar à lista
      </Link>

      {finalizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Finalizar chamado</h2>
            <p className="mt-1 text-sm text-slate-600">Descreva a solução aplicada ou o encerramento para o solicitante.</p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                mutFinalize.mutate(resolutionNote.trim());
              }}
            >
              <textarea
                required
                minLength={5}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Comentário de finalização (mín. 5 caracteres)…"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={mutFinalize.isPending}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Confirmar finalização
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setFinalizeOpen(false)}
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              mutUpdate.mutate(
                { status: "CANCELADO", resolutionNote: cancelNote.trim() },
                {
                  onSuccess: () => {
                    setCancelOpen(false);
                    setCancelNote("");
                  },
                }
              );
            }}
          >
            <h2 className="text-lg font-bold text-slate-900">Cancelar chamado</h2>
            <textarea
              required
              minLength={5}
              rows={4}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Motivo do cancelamento…"
              value={cancelNote}
              onChange={(e) => setCancelNote(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                Confirmar cancelamento
              </button>
              <button type="button" className="rounded-xl border px-4 py-2 text-sm" onClick={() => setCancelOpen(false)}>
                Fechar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.title}</h1>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={t.status} />
            {isTech && <PriorityBadge priority={t.priority} />}
            {isTech && t.slaLevel && <SlaBadge level={t.slaLevel} />}
          </div>
        </div>

        {isOpenStatus(t.status) && (
          <TicketTimeInfo ticket={t} showSla={isTech} className="mt-4" />
        )}

        <dl className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-600">Abertura</dt>
            <dd>{fmt(t.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-600">Finalização</dt>
            <dd>{fmt(t.resolvedAt)}</dd>
          </div>
        </dl>

        <p className="mt-4 whitespace-pre-wrap text-slate-800">{t.description}</p>

        <dl className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Tipo da ocorrência</dt>
            <dd>{t.occurrenceType || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Estabelecimento / filial</dt>
            <dd>{t.establishment || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">E-mail do solicitante</dt>
            <dd>{t.requesterEmail || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Gestor da área</dt>
            <dd>
              {t.managerName || "—"}
              {t.managerEmail ? (
                <>
                  <br />
                  <span className="text-xs text-slate-500">{t.managerEmail}</span>
                </>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Técnico responsável</dt>
            <dd>{technicianLabel(t.technicianKey)}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Categoria (interno)</dt>
            <dd>{t.category}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Solicitante (conta)</dt>
            <dd>{t.requester?.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Técnico atribuído (usuário)</dt>
            <dd>{t.assignedTo?.name || "—"}</dd>
          </div>
        </dl>

        {t.attachments?.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">Anexos</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {t.attachments.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="text-sky-700 hover:underline"
                    onClick={() => downloadTicketAttachment(t.id, a.id, a.originalName)}
                  >
                    {a.originalName}
                  </button>
                  <span className="ml-2 text-xs text-slate-400">({Math.round((a.size || 0) / 1024)} KB)</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {t.resolutionNote && (
          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
            <h3 className="text-sm font-semibold text-emerald-900">Finalização</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-950">{t.resolutionNote}</p>
          </div>
        )}

        {isTech && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-sm font-semibold text-slate-800">Gestão TI</h2>
            {panelError && <p className="mt-2 text-sm text-red-600">{panelError}</p>}
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-slate-500">Prioridade</label>
                <select
                  className="mt-1 block rounded-xl border border-slate-200 px-2 py-2 text-sm"
                  value={t.priority}
                  onChange={(e) => mutUpdate.mutate({ priority: e.target.value })}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">SLA</label>
                <select
                  className="mt-1 block rounded-xl border border-slate-200 px-2 py-2 text-sm"
                  value={t.slaLevel}
                  onChange={(e) => mutUpdate.mutate({ slaLevel: e.target.value })}
                >
                  {SLA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Técnico (card)</label>
                <select
                  className="mt-1 block rounded-xl border border-slate-200 px-2 py-2 text-sm"
                  value={t.technicianKey || ""}
                  onChange={(e) => mutUpdate.mutate({ technicianKey: e.target.value })}
                >
                  {TECHNICIANS.map((x) => (
                    <option key={x.key} value={x.key}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {canFinalize && (
              <button
                type="button"
                className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 sm:w-auto"
                onClick={() => {
                  setPanelError("");
                  setResolutionNote("");
                  setFinalizeOpen(true);
                }}
              >
                Finalizar chamado…
              </button>
            )}

            {isAdmin && t.status !== "CANCELADO" && t.status !== "RESOLVIDO" && (
              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 sm:ml-3 sm:mt-4 sm:w-auto"
                onClick={() => setCancelOpen(true)}
              >
                Cancelar chamado…
              </button>
            )}
          </div>
        )}

        {isAdmin && t.status !== "RESOLVIDO" && t.status !== "CANCELADO" && (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <h3 className="text-sm font-semibold text-amber-950">Administração</h3>
            <p className="mt-1 text-xs text-amber-900/80">Ajuste fino de status (fluxo interno). Encerramentos também pelo botão Finalizar.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm"
                value={t.status}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "RESOLVIDO" || v === "CANCELADO") {
                    setPanelError("Para RESOLVIDO use Finalizar. Para CANCELADO use o botão de cancelar.");
                    return;
                  }
                  mutUpdate.mutate({ status: v });
                }}
              >
                {openStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isAdmin && t.status !== "RESOLVIDO" && t.status !== "CANCELADO" && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Atribuir usuário (opcional)</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                className="rounded-xl border border-slate-200 px-2 py-2 text-sm"
                value={assignId}
                onChange={(e) => setAssignId(e.target.value)}
              >
                <option value="">— Não atribuído —</option>
                {techOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => mutAssign.mutate()}
                className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Salvar atribuição
              </button>
            </div>
          </div>
        )}
      </div>

      {t.history?.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="font-semibold text-slate-900">Histórico</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {t.history.map((h) => (
              <li key={h.id}>
                <span className="font-medium text-slate-800">{h.field}</span>: {h.oldValue ?? "—"} → {h.newValue}{" "}
                <span className="text-xs text-slate-400">({new Date(h.changedAt).toLocaleString("pt-BR")})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="font-semibold text-slate-900">Comentários</h2>
        <div className="mt-4">
          <CommentList comments={commentsQ.data || []} />
        </div>
        <form
          className="mt-6 space-y-3 border-t border-slate-100 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim()) return;
            mutComment.mutate();
          }}
        >
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            placeholder="Escreva um comentário…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {isTech && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
              Comentário interno (somente TI)
            </label>
          )}
          <button
            type="submit"
            disabled={mutComment.isPending}
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
}
