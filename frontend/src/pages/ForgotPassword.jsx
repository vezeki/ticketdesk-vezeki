import { useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../services/auth.service.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setPending(true);
    try {
      await authApi.forgotPassword(email);
      setMsg("Se o e-mail existir na base, você receberá instruções (verifique também o console do servidor se o SMTP não estiver configurado).");
    } catch {
      setMsg("Não foi possível processar agora. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="text-xl font-bold">Recuperar senha</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Seu e-mail"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Enviar
          </button>
        </form>
        {msg && <p className="mt-4 text-sm text-slate-600">{msg}</p>}
        <Link to="/login" className="mt-6 inline-block text-sm text-brand-600 hover:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
