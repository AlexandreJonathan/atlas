import { BrainCircuit, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  MOCK_ATLAS_AI_MESSAGES,
  type AtlasAiMessage,
} from "../data/mockAtlasAiChat";
import Button from "../components/ui/Button";
import { useBills } from "../hooks/useBills";
import { useFinancialProfile } from "../hooks/useFinancialProfile";
import { useFinancialSummary } from "../hooks/useFinancialSummary";
import { useFixedExpenses } from "../hooks/useFixedExpenses";
import { useGoals } from "../hooks/useGoals";
import { usePlanning } from "../hooks/usePlanning";
import { useTransactions } from "../hooks/useTransactions";
import {
  IntelligenceFeed,
  useAtlasIntelligence,
  type ChatMessage,
} from "../modules/atlas-intelligence";
import "./AtlasAIPage.css";

function AtlasAIPage() {
  const transacoes = useTransactions();
  const contas = useBills();
  const metas = useGoals();
  const perfil = useFinancialProfile();
  const despesasFixas = useFixedExpenses();
  const resumo = useFinancialSummary(transacoes, contas);
  const planejamento = usePlanning(perfil, despesasFixas, resumo, contas, metas);
  const intelligence = useAtlasIntelligence(
    resumo,
    contas,
    metas,
    transacoes,
    planejamento,
  );

  const [mensagens, setMensagens] = useState<AtlasAiMessage[]>(MOCK_ATLAS_AI_MESSAGES);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo || enviando) return;

    const idUser = `local-user-${Date.now()}`;
    const idAssistant = `local-assistant-${Date.now()}`;
    const historico: ChatMessage[] = [
      ...mensagens.map((m) => ({
        id: m.id,
        role: m.role as ChatMessage["role"],
        content: m.content,
      })),
      { id: idUser, role: "user", content: conteudo },
    ];

    setMensagens((atual) => [...atual, { id: idUser, role: "user", content: conteudo }]);
    setTexto("");
    setEnviando(true);

    try {
      const resposta = await intelligence.ask(historico);
      setMensagens((atual) => [
        ...atual,
        { id: idAssistant, role: "assistant", content: resposta },
      ]);
    } catch {
      setMensagens((atual) => [
        ...atual,
        {
          id: idAssistant,
          role: "assistant",
          content: "Não consegui responder agora. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="atlas-ai-page">
      <header className="atlas-ai-header">
        <div className="atlas-ai-header-brand">
          <span className="atlas-ai-header-icon" aria-hidden="true">
            <BrainCircuit size={24} />
          </span>
          <div>
            <h1>Atlas Intelligence</h1>
            <p>Seu centro de conversa financeira</p>
          </div>
        </div>
      </header>

      <IntelligenceFeed items={intelligence.feed} limit={8} />

      <div className="atlas-ai-thread" role="log" aria-live="polite" aria-relevant="additions">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`atlas-ai-bubble atlas-ai-bubble-${mensagem.role}`}
          >
            {mensagem.content}
          </div>
        ))}
      </div>

      <form className="atlas-ai-composer" onSubmit={(e) => void handleSubmit(e)}>
        <label className="atlas-sr-only" htmlFor="atlas-ai-input">
          Mensagem para a Atlas IA
        </label>
        <input
          id="atlas-ai-input"
          type="text"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Pergunte algo..."
          autoComplete="off"
          disabled={enviando}
        />
        <Button type="submit" size="sm" aria-label="Enviar mensagem" loading={enviando}>
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

export default AtlasAIPage;
