import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const linkClass =
  ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-sky-600 text-white shadow-md" : "text-slate-700 hover:bg-slate-100"
  }`;

export function AppLayout() {
  const { user, logout, isAdmin, isTech } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
        Início
      </NavLink>
      <NavLink to="/tickets" end className={linkClass} onClick={() => setMobileOpen(false)}>
        Chamados
      </NavLink>
      <NavLink to="/tickets/new" className={linkClass} onClick={() => setMobileOpen(false)}>
        Abrir chamado
      </NavLink>
      {isTech && (
        <NavLink to="/ti/quadro" className={linkClass} onClick={() => setMobileOpen(false)}>
          Quadro TI
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin/users" className={linkClass} onClick={() => setMobileOpen(false)}>
          Usuários
        </NavLink>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm md:flex">
        <div className="border-b border-slate-100 px-4 py-5">
          <div className="text-lg font-bold tracking-tight text-sky-800">TicketDesk</div>
          <p className="mt-1 truncate text-xs text-slate-500">{user?.name}</p>
          <p className="text-xs font-medium text-slate-400">
            {user?.role}
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">{nav}</nav>
        <div className="p-3">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <span className="font-bold tracking-tight text-sky-800">TicketDesk</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
              onClick={() => setMobileOpen((v) => !v)}
            >
              Menu
            </button>
            <button type="button" onClick={() => logout()} className="text-sm font-medium text-slate-600">
              Sair
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="border-b border-slate-200 bg-white px-3 py-3 shadow-sm md:hidden">
            <nav className="flex flex-col gap-1">{nav}</nav>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
