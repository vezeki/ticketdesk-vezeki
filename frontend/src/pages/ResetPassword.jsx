import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import * as authApi from "../services/auth.service.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      await authApi.resetPassword(token, password);
      setMsg("Senha alterada. Redirecionando…");
      setTimeout(() => nav("/login"), 1500);
    } catch (e) {
      setErr(e.response?.data?.error || "Token inválido ou expirado");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-xl font-bold">Nova senha</h1>
        {!token && <p className="mt-2 text-sm text-red-600">Token ausente na URL.</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            required
            minLength={8}
            placeholder="Nova senha (mín. 8 caracteres)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={!token}
            className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Salvar
          </button>
        </form>
        {msg && <p className="mt-4 text-sm text-emerald-700">{msg}</p>}
        <Link to="/login" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
}
