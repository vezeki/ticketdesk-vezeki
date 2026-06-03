import { Link } from "react-router-dom";
import { Building2, User } from "lucide-react";
import { PriorityBadge } from "./PriorityBadge.jsx";
import { SlaBadge } from "./SlaBadge.jsx";
import { StatusBadge } from "./StatusBadge.jsx";
import { TicketTimeInfo } from "./TicketTimeInfo.jsx";
import { technicianLabel } from "../constants/ticketMeta.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { isOpenStatus } from "../utils/ticketTime.js";

export function TicketCard({ ticket, draggable, onDragStart }) {
  const { isTech, user } = useAuth();
  const isOwn = ticket.requesterId === user?.id;
  const isDeptPeer =
    !isOwn &&
    user?.department &&
    ticket.requester?.department &&
    user.department.toLowerCase() === ticket.requester.department.toLowerCase();

  const inner = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 leading-snug">{ticket.title}</h3>
          {isDeptPeer && (
            <span className="mt-1 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
              Departamento
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <StatusBadge status={ticket.status} />
          {isTech && <PriorityBadge priority={ticket.priority} />}
          {isTech && ticket.slaLevel && <SlaBadge level={ticket.slaLevel} />}
        </div>
      </div>

      {isOpenStatus(ticket.status) && (
        <TicketTimeInfo ticket={ticket} showSla={isTech} className="mt-3" />
      )}

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{ticket.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {technicianLabel(ticket.technicianKey)}
        </span>
        {ticket.establishment && (
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {ticket.establishment}
          </span>
        )}
        {ticket.requester && (
          <span className="text-slate-400">
            {isOwn ? "Seu chamado" : `Por ${ticket.requester.name}`}
          </span>
        )}
      </div>
    </>
  );

  if (draggable) {
    return (
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/json", JSON.stringify({ id: ticket.id }));
          e.dataTransfer.effectAllowed = "move";
          onDragStart?.(ticket);
        }}
        className="cursor-grab rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100 active:cursor-grabbing"
      >
        <Link to={`/tickets/${ticket.id}`} className="block hover:opacity-95" onClick={(e) => e.stopPropagation()}>
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      {inner}
    </Link>
  );
}
