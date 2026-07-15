import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors";
import { supabase } from "../lib/supabase";
import type { ResetPasswordFormData } from "../types/auth";
import { resetPasswordSchema } from "../validations/resetPasswordSchema";

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
    setTimeout(() => navigate("/dashboard"), 1500);
  }

  if (estadoLink === "verificando") {
    return <div className="carregando">Verificando link...</div>;
  }

  if (estadoLink === "invalido") {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 Atlas</h1>

          <h2>Link inválido ou expirado</h2>

          <p>Este link de redefinição de senha não é mais válido. Solicite um novo.</p>

          <span>
            <Link to="/esqueci-senha">Esqueci minha senha</Link>
          </span>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🚀 Atlas</h1>

          <h2>Senha redefinida!</h2>

          <p>Sua senha foi alterada com sucesso. Redirecionando para o seu painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🚀 Atlas</h1>

        <h2>Crie uma nova senha</h2>

        <p>Escolha uma nova senha para sua conta.</p>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="campo">
            <input
              type="password"
              placeholder="Nova senha"
              aria-label="Nova senha"
              autoFocus
              {...register("senha")}
            />
            {errors.senha && <span className="erro-campo">{errors.senha.message}</span>}
          </div>

          <div className="campo">
            <input
              type="password"
              placeholder="Confirme a nova senha"
              aria-label="Confirme a nova senha"
              {...register("confirmarSenha")}
            />
            {errors.confirmarSenha && <span className="erro-campo">{errors.confirmarSenha.message}</span>}
          </div>

          {erroGeral && <span className="erro-geral">{erroGeral}</span>}

          <button type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
