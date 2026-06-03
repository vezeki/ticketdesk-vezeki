import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchTickets } from "../../services/ticket.service.js";
import { TicketCard } from "../../components/TicketCard.jsx";
import { SLA_OPTIONS } from "../../components/SlaBadge.jsx";
import { TECHNICIANS } from "../../constants/ticketMeta.js";
import { ESTABLISHMENTS } from "../../constants/establishments.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { isOpenStatus } from "../../utils/ticketTime.js";

const categories = ["Hardware", "Software", "Rede", "Acesso", "Outros"];
const statuses = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "RESOLVIDO", label: "Resolvido" },
  { value: "CANCELADO", label: "Cancelado" },
];
const priorities = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Média" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

const emptyFilters = {
  q: "",
  status: "",
  priority: "",
  slaLevel: "",
  category: "",
  technicianKey: "",
  establishment: "",
  openOnly: false,
};

export default function TicketList() {
  const { isTech } = useAuth();
  const [filters, setFilters] = useState(emptyFilters);
  const [showFilters, setShowFilters] = useState(true);

  const params = useMemo(() => {
    const p = { limit: 80 };
    if (filters.q.trim()) p.q = filters.q.trim();
    if (filters.status) p.status = filters.status;
    if (filters.priority) p.priority = filters.priority;
    if (filters.slaLevel) p.slaLevel = filters.slaLevel;
    if (filters.category) p.category = filters.category;
    if (filters.technicianKey) p.technicianKey = filters.technicianKey;
    return p;
  }, [filters]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", params],
    queryFn: () => fetchTickets(params),
  });

  const tickets = data?.data || [];
  const filteredByEstablishment = tickets
    .filter((t) => !filters.establishment || t.establishment === filters.establishment)
    .filter((t) => !filters.openOnly || isOpenStatus(t.status));

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "openOnly") return v;
    return Boolean(v);
  }).length;

  function clearFilters() {
    setFilters(emptyFilters);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chamados</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isTech
              ? "Filtre por status, prioridade, SLA e técnico. Use o quadro TI para visão Kanban."
              : "Acompanhe seus chamados e os em aberto do seu departamento."}
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-700"
        >
          Abrir chamado
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar título, descrição ou e-mail…"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
          </div>
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, openOnly: !f.openOnly, status: "" }))}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              filters.openOnly
                ? "bg-sky-600 text-white"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Só em aberto
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-sky-600 px-1.5 py-0.5 text-xs text-white">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <select
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={filters.status}
              disabled={filters.openOnly}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, openOnly: false }))}
            >
              <option value="">Status (todos)</option>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={filters.establishment}
              onChange={(e) => setFilters((f) => ({ ...f, establishment: e.target.value }))}
            >
              <option value="">Filial (todas)</option>
              {ESTABLISHMENTS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>

            {isTech && (
              <>
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={filters.priority}
                  onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
                >
                  <option value="">Prioridade</option>
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={filters.slaLevel}
                  onChange={(e) => setFilters((f) => ({ ...f, slaLevel: e.target.value }))}
                >
                  <option value="">SLA</option>
                  {SLA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </>
            )}

            <select
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">Categoria</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={filters.technicianKey}
              onChange={(e) => setFilters((f) => ({ ...f, technicianKey: e.target.value }))}
            >
              <option value="">Técnico</option>
              {TECHNICIANS.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {filteredByEstablishment.length} chamado(s) encontrado(s)
      </p>

      {isLoading && <p className="mt-8 text-slate-600">Carregando…</p>}
      {error && <p className="mt-8 text-red-600">Erro ao carregar chamados.</p>}

      <div className="mt-4 grid gap-4">
        {filteredByEstablishment.length ? (
          filteredByEstablishment.map((t) => <TicketCard key={t.id} ticket={t} />)
        ) : (
          !isLoading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
              <p className="text-slate-600">Nenhum chamado com estes filtros.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="mt-2 text-sm font-medium text-sky-700 hover:underline">
                  Limpar filtros
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
