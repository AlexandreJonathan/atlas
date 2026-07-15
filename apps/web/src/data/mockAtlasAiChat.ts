export type AtlasAiMessageRole = "user" | "assistant";

export type AtlasAiMessage = {
  id: string;
  role: AtlasAiMessageRole;
  content: string;
};

/** Mensagens simuladas do chat Atlas IA — sem integração com LLM. */
export const MOCK_ATLAS_AI_MESSAGES: AtlasAiMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content: "Olá! Sou a Atlas Intelligence. Estou aqui para ajudar você a organizar sua vida financeira.",
  },
  {
    id: "msg-2",
    role: "user",
    content: "Como está minha situação este mês?",
  },
  {
    id: "msg-3",
    role: "assistant",
    content:
      "Pelo que vejo no seu painel, o ideal é acompanhar as próximas contas e manter o foco nas suas metas. Quando a IA real estiver ativa, trarei análises personalizadas com base nos seus dados.",
  },
  {
    id: "msg-4",
    role: "user",
    content: "Posso investir agora?",
  },
  {
    id: "msg-5",
    role: "assistant",
    content:
      "A Atlas não vende investimentos. Posso te ajudar a estudar conceitos e a organizar sua reserva — a decisão de investir é sempre sua, com quem você escolher.",
  },
];

export const MOCK_ATLAS_AI_REPLY =
  "Entendi. Em breve vou conseguir responder com base nos seus dados reais — por enquanto, acompanhe o painel e as recomendações da Home.";
