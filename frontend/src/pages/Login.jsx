import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      nav(loc.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Falha no login");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-sky-600 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">TicketDesk</h1>
        <p className="mt-1 text-sm text-slate-600">Entre com sua conta corporativa</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          <Link to="/forgot-password" className="text-brand-600 hover:underline">
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </div>
  );
}
