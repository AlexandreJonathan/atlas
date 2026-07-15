import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { RegisterFormData } from "../types/auth";
import { registerSchema } from "../validations/registerSchema";

function Register() {
  const navigate = useNavigate();
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cadastroPendente, setCadastroPendente] = useState(false);
  const [emailCadastrado, setEmailCadastrado] = useState("");
  const [reenviando, setReenviando] = useState(false);
  const [confirmacaoReenviada, setConfirmacaoReenviada] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(dados: RegisterFormData) {
    if (!supabase) {
      setErroGeral("Supabase não está configurado. Verifique as variáveis de ambiente.");
      return;
    }

    setErroGeral("");
    setEnviando(true);

    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: { nome: dados.nome },
      },
    });

    setEnviando(false);

    if (error) {
      setErroGeral(getAuthErrorMessage(error.message));
      return;
    }

    // Se o projeto Supabase exigir confirmação de e-mail, `signUp` não
    // retorna uma sessão — nesse caso, em vez de mandar o usuário para
    // /login sem explicação (comportamento anterior à Sprint 6), mostramos
    // uma tela dedicada avisando que é preciso confirmar o e-mail antes de
    // entrar, com opção de reenvio.
    if (data.session) {
      navigate("/dashboard");
      return;
    }

    setEmailCadastrado(dados.email);
    setCadastroPendente(true);
  }

  async function handleReenviarConfirmacao() {
    if (!supabase || !emailCadastrado) return;

    setReenviando(true);
    setConfirmacaoReenviada(false);
    setErroGeral("");

    const { error } = await supabase.auth.resend({ type: "signup", email: emailCadastrado });

    setReenviando(false);

    if (error) {
      setErroGeral(getAuthErrorMessage(error.message));
      return;
    }

    setConfirmacaoReenviada(true);
  }

  if (cadastroPendente) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 Atlas</h1>

          <h2>Confirme seu e-mail</h2>

          <p>
            Enviamos um link de confirmação para <strong>{emailCadastrado}</strong>. Abra seu e-mail e clique
            no link para ativar sua conta antes de entrar.
          </p>

          {confirmacaoReenviada && (
            <span className="mensagem-sucesso">
              E-mail reenviado. Verifique sua caixa de entrada (e a pasta de spam).
            </span>
          )}

          {erroGeral && <span className="erro-geral">{erroGeral}</span>}

          <button type="button" onClick={handleReenviarConfirmacao} disabled={reenviando}>
            {reenviando ? "Reenviando..." : "Reenviar e-mail de confirmação"}
          </button>

          <span>
            Já confirmou?
            <Link to="/login">Entrar</Link>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 Atlas</h1>

        <h2>Criar conta</h2>

        <p>Comece hoje sua organização financeira.</p>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input type="text" placeholder="Seu nome" aria-label="Seu nome" {...register("nome")} />
            {errors.nome && <span className="erro-campo">{errors.nome.message}</span>}
          </div>

          <div className="campo">
            <input type="email" placeholder="Seu e-mail" aria-label="Seu e-mail" {...register("email")} />
            {errors.email && <span className="erro-campo">{errors.email.message}</span>}
          </div>

          <div className="campo">
            <input type="password" placeholder="Crie uma senha" aria-label="Crie uma senha" {...register("senha")} />
            {errors.senha && <span className="erro-campo">{errors.senha.message}</span>}
          </div>

          {erroGeral && <span className="erro-geral">{erroGeral}</span>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <span>
          Já possui conta?
          <Link to="/login">Entrar</Link>
        </span>
      </div>
    </div>
  );
}

export default Register;
