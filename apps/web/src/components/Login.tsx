import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { analytics } from "../lib/analytics";
import { getAuthErrorMessage, MENSAGEM_EMAIL_NAO_CONFIRMADO } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { LoginFormData } from "../types/auth";
import { loginSchema } from "../validations/loginSchema";
import AuthLayout from "./AuthLayout";
import Button from "./ui/Button";
import Input from "./ui/Input";

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

    analytics.track("login");
    navigate("/inicio");
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
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para continuar sua jornada financeira."
      footer={
        <span>
          Ainda não possui conta?
          <Link to="/cadastro" className="atlas-link">
            Criar conta
          </Link>
        </span>
      }
    >
      <form className="atlas-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          type="email"
          placeholder="Seu e-mail"
          aria-label="Seu e-mail"
          icon={<Mail size={18} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          type="password"
          placeholder="Sua senha"
          aria-label="Sua senha"
          icon={<Lock size={18} />}
          error={errors.senha?.message}
          {...register("senha")}
        />

        <div className="atlas-auth-links">
          <Link to="/esqueci-senha" className="atlas-link">
            Esqueceu sua senha?
          </Link>
        </div>

        {erroGeral && (
          <span className="atlas-erro-geral">
            {erroGeral}
            {erroGeral === MENSAGEM_EMAIL_NAO_CONFIRMADO && (
              <>
                {" "}
                <button
                  type="button"
                  className="atlas-link atlas-link-botao"
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
          <span className="atlas-mensagem-sucesso">
            E-mail de confirmação reenviado. Verifique sua caixa de entrada.
          </span>
        )}

        <Button type="submit" fullWidth loading={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
