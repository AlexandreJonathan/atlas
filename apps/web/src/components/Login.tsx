import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage, MENSAGEM_EMAIL_NAO_CONFIRMADO } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { LoginFormData } from "../types/auth";
import { loginSchema } from "../validations/loginSchema";

function Login() {
  const navigate = useNavigate();
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [confirmacaoReenviada, setConfirmacaoReenviada] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(dados: LoginFormData) {
    if (!supabase) {
      setErroGeral("Supabase não está configurado. Verifique as variáveis de ambiente.");
      return;
    }

    setErroGeral("");
    setConfirmacaoReenviada(false);
    setEnviando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha,
    });

    setEnviando(false);

    if (error) {
      setErroGeral(getAuthErrorMessage(error.message));
      return;
    }

    navigate("/dashboard");
  }

  async function handleReenviarConfirmacao() {
    if (!supabase) return;

    const email = getValues("email");
    if (!email) return;

    setReenviando(true);
    setConfirmacaoReenviada(false);

    const { error } = await supabase.auth.resend({ type: "signup", email });

    setReenviando(false);

    if (error) {
      setErroGeral(getAuthErrorMessage(error.message));
      return;
    }

    setConfirmacaoReenviada(true);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 Atlas</h1>

        <h2>Bem-vindo de volta</h2>

        <p>Entre para continuar sua jornada financeira.</p>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input type="email" placeholder="Seu e-mail" aria-label="Seu e-mail" {...register("email")} />
            {errors.email && <span className="erro-campo">{errors.email.message}</span>}
          </div>

          <div className="campo">
            <input type="password" placeholder="Sua senha" aria-label="Sua senha" {...register("senha")} />
            {errors.senha && <span className="erro-campo">{errors.senha.message}</span>}
          </div>

          <div className="login-links">
            <Link to="/esqueci-senha">Esqueceu sua senha?</Link>
          </div>

          {erroGeral && (
            <span className="erro-geral">
              {erroGeral}
              {erroGeral === MENSAGEM_EMAIL_NAO_CONFIRMADO && (
                <>
                  {" "}
                  <button
                    type="button"
                    className="link-botao"
                    onClick={handleReenviarConfirmacao}
                    disabled={reenviando}
                  >
                    {reenviando ? "Reenviando..." : "Reenviar e-mail de confirmação"}
                  </button>
                </>
              )}
            </span>
          )}

          {confirmacaoReenviada && (
            <span className="mensagem-sucesso">
              E-mail de confirmação reenviado. Verifique sua caixa de entrada.
            </span>
          )}

          <button type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <span>
          Ainda não possui conta?
          <Link to="/cadastro">Criar conta</Link>
        </span>
      </div>
    </div>
  );
}

export default Login;
