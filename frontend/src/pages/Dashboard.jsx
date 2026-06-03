import { useAuth } from "../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
  Clock,
  Kanban,
  PlusCircle,
  Users,
} from "lucide-react";
import { fetchTickets } from "../services/ticket.service.js";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { PriorityBadge } from "../components/PriorityBadge.jsx";
import { TicketTimeInfo } from "../components/TicketTimeInfo.jsx";
import { technicianLabel } from "../constants/ticketMeta.js";
import { isOpenStatus } from "../utils/ticketTime.js";

export default function Dashboard() {
  const { user, isTech } = useAuth();

  const { data } = useQuery({
    queryKey: ["tickets", "dash-kpi"],
    queryFn: () => fetchTickets({ limit: 200 }),
    enabled: Boolean(isTech),
  });

  const { data: recent } = useQuery({
    queryKey: ["tickets", "dash-recent"],
    queryFn: () => fetchTickets({ limit: 12 }),
  });

  const tickets = data?.data || [];
  const recentTickets = recent?.data || [];

  const kpi = isTech
    ? tickets.reduce(
        (acc, t) => {
          const open = isOpenStatus(t.status);
          if (open) acc.abertos += 1;
          if (open && t.priority === "CRITICA") acc.criticos += 1;
          if (open && t.status === "AGUARDANDO") acc.aguardando += 1;
          if (t.status === "EM_ANDAMENTO") acc.andamento += 1;
          return acc;
        },
        { abertos: 0, criticos: 0, aguardando: 0, andamento: 0 }
      )
    : null;

  const userKpi = !isTech
    ? recentTickets.reduce(
        (acc, t) => {
          const open = isOpenStatus(t.status);
          if (open && t.requesterId === user?.id) acc.meus += 1;
          if (
            open &&
            t.requesterId !== user?.id &&
            user?.department &&
            t.requester?.department?.toLowerCase() === user.department.toLowerCase()
          ) {
            acc.departamento += 1;
          }
          return acc;
        },
        { meus: 0, departamento: 0 }
      )
    : null;

  const quickLinks = [
    {
      to: "/tickets/new",
      icon: PlusCircle,
      title: "Abrir chamado",
      desc: "Registre uma nova ocorrência com filial, gestor e técnico.",
      accent: "from-emerald-500 to-teal-600",
    },
    {
      to: "/tickets",
      icon: ClipboardList,
      title: "Meus chamados",
      desc: "Acompanhe status, comentários e histórico.",
      accent: "from-sky-500 to-blue-600",
    },
    ...(isTech
      ? [
          {
            to: "/ti/quadro",
            icon: Kanban,
            title: "Quadro TI",
            desc: "Kanban com prazos SLA e arrastar entre colunas.",
            accent: "from-violet-500 to-indigo-600",
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 p-8 text-white shadow-2xl ring-1 ring-white/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-medium text-sky-200/90">Bem-vindo ao TicketDesk</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Olá, {user?.name?.split(" ")[0] || user?.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sky-100/90">
            {isTech
              ? "Central de operação da TI: acompanhe prazos SLA, prioridades e mova chamados no quadro Kanban."
              : user?.department
                ? `Departamento ${user.department}: você vê seus chamados e os comunicados em aberto do seu time.`
                : "Abra chamados, acompanhe o andamento e converse com a TI pelos comentários."}
          </p>

          {isTech && kpi && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Em aberto", value: kpi.abertos, tone: "bg-white/10" },
                { label: "Em andamento", value: kpi.andamento, tone: "bg-amber-400/20" },
                { label: "Aguardando", value: kpi.aguardando, tone: "bg-violet-400/20" },
                { label: "Críticos", value: kpi.criticos, tone: "bg-rose-500/25" },
              ].map((c) => (
                <div key={c.label} className={`rounded-2xl ${c.tone} px-4 py-4 ring-1 ring-white/10`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">{c.label}</p>
                  <p className="mt-1 text-3xl font-bold">{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {!isTech && userKpi && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
                <p className="text-xs font-medium uppercase tracking-wide text-white/70">Seus chamados abertos</p>
                <p className="mt-1 text-3xl font-bold">{userKpi.meus}</p>
              </div>
              {user?.department && (
                <div className="rounded-2xl bg-violet-400/20 px-4 py-4 ring-1 ring-violet-200/30">
                  <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-violet-100">
                    <Users className="h-3.5 w-3.5" />
                    Abertos no departamento
                  </p>
                  <p className="mt-1 text-3xl font-bold">{userKpi.departamento}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-sky-50"
            >
              <PlusCircle className="h-4 w-4" />
              Novo chamado
            </Link>
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Ver chamados
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${item.accent} p-2.5 text-white shadow-md`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-sky-800">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-sky-700">
                Acessar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Clock className="h-5 w-5 text-sky-600" />
            Atividade recente
          </h2>
          <Link to="/tickets" className="text-sm font-medium text-sky-700 hover:underline">
            Ver todos
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {recentTickets.length === 0 && (
            <li className="py-8 text-center text-sm text-slate-500">Nenhum chamado registrado ainda.</li>
          )}
          {recentTickets.slice(0, 8).map((t) => (
            <li key={t.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link to={`/tickets/${t.id}`} className="font-medium text-slate-900 hover:text-sky-800">
                  {t.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {technicianLabel(t.technicianKey)} · {t.establishment || "—"}
                  {t.requester && t.requesterId !== user?.id ? ` · ${t.requester.name}` : ""}
                </p>
                {isOpenStatus(t.status) && (
                  <TicketTimeInfo ticket={t} showSla={isTech} className="mt-2" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={t.status} />
                {isTech && <PriorityBadge priority={t.priority} />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
