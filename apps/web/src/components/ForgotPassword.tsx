import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { ForgotPasswordFormData } from "../types/auth";
import { forgotPasswordSchema } from "../validations/forgotPasswordSchema";

function ForgotPassword() {
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(dados: ForgotPasswordFormData) {
    if (!supabase) {
      setErroGeral("Supabase não está configurado. Verifique as variáveis de ambiente.");
      return;
    }

    setErroGeral("");
    setEnviando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(dados.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setEnviando(false);

    if (error) {
      setErroGeral(getAuthErrorMessage(error.message));
      return;
    }

    // Mesma mensagem de sucesso independentemente de o e-mail existir ou
    // não na base — evita permitir que alguém descubra quais e-mails estão
    // cadastrados (enumeração de usuários) só tentando "esqueci a senha".
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 Atlas</h1>

          <h2>Verifique seu e-mail</h2>

          <p>
            Se este e-mail estiver cadastrado, você receberá em poucos minutos um link para redefinir sua
            senha.
          </p>

          <span>
            <Link to="/login">Voltar para o login</Link>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 Atlas</h1>

        <h2>Esqueceu sua senha?</h2>

        <p>Informe seu e-mail e enviaremos um link para você criar uma nova senha.</p>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input
              type="email"
              placeholder="Seu e-mail"
              aria-label="Seu e-mail"
              autoFocus
              {...register("email")}
            />
            {errors.email && <span className="erro-campo">{errors.email.message}</span>}
          </div>

          {erroGeral && <span className="erro-geral">{erroGeral}</span>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>

        <span>
          Lembrou a senha?
          <Link to="/login">Entrar</Link>
        </span>
      </div>
    </div>
  );
}

export default ForgotPassword;
