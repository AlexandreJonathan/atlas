export const MENSAGEM_PADRAO = "Ocorreu um erro inesperado. Tente novamente em alguns instantes.";

// Erros de banco de dados/rede não devem ser expostos diretamente ao usuário
// (mensagens técnicas do Postgres/Supabase). O erro real é logado para
// depuração e uma mensagem amigável e genérica é exibida na interface.
export function getFriendlyErrorMessage(error: unknown, fallback: string = MENSAGEM_PADRAO): string {
  if (error instanceof Error) {
    console.error("[Atlas]", error.message);
  } else {
    console.error("[Atlas] Erro desconhecido:", error);
  }

  return fallback;
}
