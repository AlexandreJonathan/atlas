export type AtlasPulseTone = "positiva" | "atencao" | "informativa" | "marca";

export type AtlasPulseMessage = {
  id: string;
  tone: AtlasPulseTone;
  text: string;
};

/**
 * Seleciona UMA mensagem inteligente para o Atlas Pulse.
 * Nesta sprint as regras são heurísticas locais (prévia da IA futura).
 * Zero I/O — puro, testável, sem alterar engines de negócio.
 */
export function selecionarAtlasPulse(input: {
  contasVencendoEmBreve: { description: string; dueDate: string }[];
  contasVencidas: { description: string }[];
  transacoesRecentes: { type: "receita" | "despesa"; description: string; amount: number }[];
  saldo: number;
  risco?: "baixo" | "medio" | "alto" | null;
}): AtlasPulseMessage {
  const vencida = input.contasVencidas[0];
  if (vencida) {
    return {
      id: "pulse-vencida",
      tone: "atencao",
      text: `${vencida.description} está vencida. Vale quitar assim que puder.`,
    };
  }

  const proxima = input.contasVencendoEmBreve[0];
  if (proxima) {
    const amanha = isAmanha(proxima.dueDate);
    return {
      id: "pulse-proxima-conta",
      tone: "atencao",
      text: amanha
        ? `Sua próxima conta (${proxima.description}) vence amanhã.`
        : `Sua próxima conta (${proxima.description}) vence em breve.`,
    };
  }

  const salarioRecente = input.transacoesRecentes.find(
    (t) => t.type === "receita" && /sal[aá]rio|pagamento|renda/i.test(t.description),
  );
  if (salarioRecente) {
    return {
      id: "pulse-salario",
      tone: "informativa",
      text: "Seu salário acabou de entrar. Bom momento para revisar metas e reserva.",
    };
  }

  if (input.saldo > 2000 && (input.risco === "baixo" || input.risco == null)) {
    return {
      id: "pulse-parado",
      tone: "marca",
      text: "Você possui dinheiro parado que poderia render. Estude opções com calma.",
    };
  }

  if (input.risco === "baixo" || input.risco == null) {
    return {
      id: "pulse-ok",
      tone: "positiva",
      text: "Tudo dentro do planejado.",
    };
  }

  return {
    id: "pulse-atencao-geral",
    tone: "atencao",
    text: "Há pontos de atenção no seu mês. A Atlas Intelligence pode ajudar.",
  };
}

function isAmanha(dueDateIso: string): boolean {
  const hoje = new Date();
  const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
  const due = new Date(`${dueDateIso}T12:00:00`);
  return (
    due.getFullYear() === amanha.getFullYear() &&
    due.getMonth() === amanha.getMonth() &&
    due.getDate() === amanha.getDate()
  );
}
