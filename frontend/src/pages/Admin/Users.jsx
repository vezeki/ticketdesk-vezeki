import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, UserPlus } from "lucide-react";
import { createUser, deactivateUser, fetchUsers, updateUser } from "../../services/user.service.js";

const roles = [
  { value: "USUARIO", label: "Usuário" },
  { value: "TECNICO", label: "Técnico" },
  { value: "ADMIN", label: "Administrador" },
];

export default function Users() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USUARIO",
    department: "",
  });
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers({ limit: 100 }),
  });

  const mutCreate = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setForm({ name: "", email: "", password: "", role: "USUARIO", department: "" });
    },
  });

  const mutDeactivate = useMutation({
    mutationFn: (id) => deactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const mutUpdate = useMutation({
    mutationFn: ({ id, ...body }) => updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const users = (data?.data || []).filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
        <p className="mt-1 text-sm text-slate-600">
          Departamento é obrigatório. Usuários do mesmo departamento visualizam comunicados em aberto uns dos outros.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="flex items-center gap-2 font-semibold text-slate-800">
          <UserPlus className="h-5 w-5 text-sky-600" />
          Novo usuário
        </h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutCreate.mutate();
          }}
        >
          <input
            placeholder="Nome completo"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={2}
          />
          <input
            placeholder="E-mail"
            type="email"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="Senha (mín. 8 caracteres)"
            type="password"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
          <select
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Departamento (obrigatório)"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm sm:col-span-2"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
            minLength={2}
          />
          <button
            type="submit"
            disabled={mutCreate.isPending}
            className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 sm:col-span-2"
          >
            {mutCreate.isPending ? "Criando…" : "Criar usuário"}
          </button>
        </form>
        {mutCreate.isError && (
          <p className="mt-2 text-sm text-red-600">{mutCreate.error?.response?.data?.error || "Erro ao criar"}</p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-4 py-3">
          <input
            type="search"
            placeholder="Buscar por nome, e-mail ou departamento…"
            className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Departamento
                  </span>
                </th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Ativo</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-slate-500">
                    Carregando…
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <input
                      className="w-full min-w-[120px] rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      defaultValue={u.department || ""}
                      placeholder="Departamento"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== (u.department || "")) {
                          mutUpdate.mutate({ id: u.id, department: v });
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                      value={u.role}
                      onChange={(e) => mutUpdate.mutate({ id: u.id, role: e.target.value })}
                    >
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.active && (
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => mutDeactivate.mutate(u.id)}
                      >
                        Desativar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
