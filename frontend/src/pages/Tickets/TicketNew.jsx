import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, UserCircle } from "lucide-react";
import { createTicket } from "../../services/ticket.service.js";
import { AREA_MANAGERS, TECHNICIANS } from "../../constants/ticketMeta.js";
import { ESTABLISHMENTS } from "../../constants/establishments.js";

export default function TicketNew() {
  const nav = useNavigate();
  const [managerId, setManagerId] = useState(AREA_MANAGERS[0]?.id || "");
  const [form, setForm] = useState({
    requesterEmail: "",
    establishment: ESTABLISHMENTS[0]?.value || "Flamin",
    occurrenceType: "",
    title: "",
    description: "",
    technicianKey: TECHNICIANS[0]?.key || "KAIQUE_OLIVEIRA",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const manager = AREA_MANAGERS.find((m) => m.id === managerId) || AREA_MANAGERS[0];

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const fields = {
        requesterEmail: form.requesterEmail.trim(),
        managerName: manager?.name || "",
        managerEmail: manager?.email || "",
        establishment: form.establishment,
        occurrenceType: form.occurrenceType.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        technicianKey: form.technicianKey,
      };
      const t = await createTicket(fields, files);
      nav(`/tickets/${t.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Não foi possível abrir o chamado");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Abrir chamado</h1>
      <p className="mt-1 text-sm text-slate-600">
        Preencha os dados da ocorrência. A equipe de TI define prioridade e prazos após o registro.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Mail className="h-4 w-4 text-sky-600" />
            E-mail do solicitante
          </label>
          <input
            type="email"
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            value={form.requesterEmail}
            onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
            placeholder="nome.sobrenome@empresa.com.br"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <UserCircle className="h-4 w-4 text-sky-600" />
              Gestor da área
            </label>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            >
              {AREA_MANAGERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">E-mail do gestor</label>
            <input
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700"
              value={manager?.email || ""}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Building2 className="h-4 w-4 text-sky-600" />
            Estabelecimento / filial
          </label>
          <select
            required
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.establishment}
            onChange={(e) => setForm({ ...form, establishment: e.target.value })}
          >
            {ESTABLISHMENTS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Tipo da ocorrência</label>
          <input
            required
            minLength={2}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.occurrenceType}
            onChange={(e) => setForm({ ...form, occurrenceType: e.target.value })}
            placeholder="Ex.: Falha de acesso, impressora, VPN…"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Título da ocorrência</label>
          <input
            required
            minLength={3}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Detalhamento da situação</label>
          <textarea
            required
            minLength={5}
            rows={6}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Técnico responsável</label>
          <select
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.technicianKey}
            onChange={(e) => setForm({ ...form, technicianKey: e.target.value })}
          >
            {TECHNICIANS.map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Anexos (opcional)</label>
          <input
            type="file"
            multiple
            className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-sky-700"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {files.length} arquivo(s) — máx. 12 arquivos, 12 MB cada.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:from-sky-700 hover:to-indigo-700 disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Registrar chamado"}
        </button>
      </form>
    </div>
  );
}
