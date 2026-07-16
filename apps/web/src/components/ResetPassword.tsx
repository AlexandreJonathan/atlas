import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { ResetPasswordFormData } from "../types/auth";
import { resetPasswordSchema } from "../validations/resetPasswordSchema";
import AuthLayout from "./AuthLayout";
import Button from "./ui/Button";
import Input from "./ui/Input";

type EstadoLink = "verificando" | "valido" | "invalido";

// O link de redefinição de senha do Supabase, ao ser aberto, faz o client
// (com `detectSessionInUrl` habilitado por padrão) processar o token da URL
// e estabelecer uma sessão de recuperação, disparando o evento
// "PASSWORD_RECOVERY" em `onAuthStateChange`. Enquanto isso não acontece (ou
// já tiver acontecido antes deste componente montar), verificamos também a
// sessão atual diretamente; se nada for encontrado após um tempo razoável,
// tratamos o link como inválido/expirado.
function ResetPassword() {
  const navigate = useNavigate();
  const [estadoLink, setEstadoLink] = useState<EstadoLink>("verificando");
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!supabase) {
      Promise.resolve().then(() => setEstadoLink("invalido"));
      return;
    }

    let ativo = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && ativo) {
        setEstadoLink("valido");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (ativo && data.session) {
        setEstadoLink("valido");
      }
    });

    const timeout = setTimeout(() => {
      if (ativo) {
        setEstadoLink((atual) => (atual === "verificando" ? "invalido" : atual));
      }
    }, 4000);

    return () => {
      ativo = false;
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(dados: ResetPasswordFormData) {
    if (!supabase) return;

    setErroGeral("");
    setEnviando(true);

    const { error } = await supabase.auth.updateUser({ password: dados.senha });

    setEnviando(false);

    if (error) {
      setErroGeral(getAuthErrorMessage(error.message));
      return;
    }

    setSucesso(true);
    setTimeout(() => navigate("/inicio"), 1500);
  }

  if (estadoLink === "verificando") {
    return <div className="atlas-page-loader">Verificando link...</div>;
  }

  if (estadoLink === "invalido") {
    return (
      <AuthLayout
        title="Link inválido ou expirado"
        subtitle="Este link de redefinição de senha não é mais válido. Solicite um novo."
        footer={
          <span>
            <Link to="/esqueci-senha" className="atlas-link">
              Esqueci minha senha
            </Link>
          </span>
        }
      />
    );
  }

  if (sucesso) {
    return (
      <AuthLayout
        title="Senha redefinida!"
        subtitle="Sua senha foi alterada com sucesso. Redirecionando para o seu painel..."
      />
    );
  }

  return (
    <AuthLayout title="Crie uma nova senha" subtitle="Escolha uma nova senha para sua conta.">
      <form className="atlas-auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          type="password"
          placeholder="Nova senha"
          aria-label="Nova senha"
          icon={<Lock size={18} />}
          autoFocus
          error={errors.senha?.message}
          {...register("senha")}
        />

        <Input
          type="password"
          placeholder="Confirme a nova senha"
          aria-label="Confirme a nova senha"
          icon={<Lock size={18} />}
          error={errors.confirmarSenha?.message}
          {...register("confirmarSenha")}
        />

        {erroGeral && <span className="atlas-erro-geral">{erroGeral}</span>}

        <Button type="submit" fullWidth loading={enviando}>
          {enviando ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
