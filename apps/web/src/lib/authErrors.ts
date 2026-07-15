import { MENSAGEM_PADRAO } from "./errorMessages";

// Exportada para permitir que a UI (Login.tsx) identifique especificamente
// esse caso e ofereça a ação de reenviar o e-mail de confirmação, em vez de
// comparar a string diretamente.
export const MENSAGEM_EMAIL_NAO_CONFIRMADO = "Confirme seu e-mail antes de entrar.";

const MENSAGENS_CONHECIDAS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": MENSAGEM_EMAIL_NAO_CONFIRMADO,
  "User already registered": "Este e-mail já está cadastrado.",
  "A user with this email address has already been registered": "Este e-mail já está cadastrado.",
  "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres.",
  "Unable to validate email address: invalid format": "Informe um e-mail válido.",
  "New password should be different from the old password": "A nova senha deve ser diferente da senha atual.",
  "For security purposes, you can only request this": "Por segurança, aguarde um momento antes de tentar novamente.",
  "Email link is invalid or has expired": "Este link expirou ou já foi utilizado. Solicite um novo.",
  "Auth session missing": "Sua sessão expirou. Solicite um novo link.",
  "Token has expired or is invalid": "Este link expirou ou já foi utilizado. Solicite um novo.",
};

export function getAuthErrorMessage(message: string | undefined): string {
  if (!message) return MENSAGEM_PADRAO;

  const chaveConhecida = Object.keys(MENSAGENS_CONHECIDAS).find((chave) =>
    message.toLowerCase().includes(chave.toLowerCase()),
  );

  return chaveConhecida ? MENSAGENS_CONHECIDAS[chaveConhecida] : MENSAGEM_PADRAO;
}
