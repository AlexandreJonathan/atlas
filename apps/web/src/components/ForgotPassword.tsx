import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { ForgotPasswordFormData } from "../types/auth";
import { forgotPasswordSchema } from "../validations/forgotPasswordSchema";
import AuthLayout from "./AuthLayout";
import Button from "./ui/Button";
import Input from "./ui/Input";

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
      <AuthLayout
        title="Verifique seu e-mail"
        subtitle="Se este e-mail estiver cadastrado, você receberá em poucos minutos um link para redefinir sua senha."
        footer={
          <span>
            <Link to="/login">Voltar para o login</Link>
          </span>
        }
      />
    );
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      subtitle="Informe seu e-mail e enviaremos um link para você criar uma nova senha."
      footer={
        <span>
          Lembrou a senha?
          <Link to="/login">Entrar</Link>
        </span>
      }
    >
      <form className="atlas-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          type="email"
          placeholder="Seu e-mail"
          aria-label="Seu e-mail"
          icon={<Mail size={18} />}
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />

        {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

        <Button type="submit" fullWidth loading={enviando}>
          {enviando ? "Enviando..." : "Enviar link de redefinição"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
