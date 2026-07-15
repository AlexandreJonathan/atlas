import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { RegisterFormData } from "../types/auth";
import { registerSchema } from "../validations/registerSchema";
import AuthLayout from "./AuthLayout";
import Button from "./ui/Button";
import Input from "./ui/Input";

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
      navigate("/inicio");
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
      <AuthLayout
        title="Confirme seu e-mail"
        subtitle={
          <>
            Enviamos um link de confirmação para <strong>{emailCadastrado}</strong>. Abra seu e-mail e clique
            no link para ativar sua conta antes de entrar.
          </>
        }
        footer={
          <span>
            Já confirmou?
            <Link to="/login">Entrar</Link>
          </span>
        }
      >
        <div className="atlas-auth-form">
          {confirmacaoReenviada && (
            <span className="atlas-mensagem-sucesso">
              E-mail reenviado. Verifique sua caixa de entrada (e a pasta de spam).
            </span>
          )}

          {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

          <Button type="button" variant="secondary" fullWidth loading={reenviando} onClick={handleReenviarConfirmacao}>
            {reenviando ? "Reenviando..." : "Reenviar e-mail de confirmação"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece hoje sua organização financeira."
      footer={
        <span>
          Já possui conta?
          <Link to="/login">Entrar</Link>
        </span>
      }
    >
      <form className="atlas-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          type="text"
          placeholder="Seu nome"
          aria-label="Seu nome"
          icon={<User size={18} />}
          error={errors.nome?.message}
          {...register("nome")}
        />

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
          placeholder="Crie uma senha"
          aria-label="Crie uma senha"
          icon={<Lock size={18} />}
          error={errors.senha?.message}
          {...register("senha")}
        />

        {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

        <Button type="submit" fullWidth loading={enviando}>
          {enviando ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;
