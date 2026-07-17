import { Activity, BrainCircuit, Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  MOCK_ATLAS_AI_MESSAGES,
  type AtlasAiMessage,
} from "../data/mockAtlasAiChat";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { usePlanning } from "../hooks/usePlanning";
import { analytics } from "../lib/analytics";
import {
  IntelligenceFeed,
  useAtlasIntelligence,
  type ChatMessage,
} from "../modules/atlas-intelligence";
import { useFinancialData } from "../modules/financial-data";
import "./AtlasAIPage.css";

function AtlasAIPage() {
  const financial = useFinancialData();
  const { contas, perfil, despesasFixas, resumo, snapshot, loading } = financial;
  const planejamento = usePlanning(perfil, despesasFixas, resumo, contas, financial.metas);
  const intelligence = useAtlasIntelligence(snapshot, loading, planejamento);

  const [mensagens, setMensagens] = useState<AtlasAiMessage[]>(MOCK_ATLAS_AI_MESSAGES);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarAtividade, setMostrarAtividade] = useState(false);
  const [modoLimitado, setModoLimitado] = useState(false);

  useEffect(() => {
    analytics.track("atlas_ai_opened");
  }, []);

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
      if (resposta.mode === "limited") {
        setModoLimitado(true);
      }
      setMensagens((atual) => [
        ...atual,
        {
          id: idAssistant,
          role: "assistant",
          content: resposta.content,
        },
      ]);
    } catch {
      setModoLimitado(true);
      setMensagens((atual) => [
        ...atual,
        {
          id: idAssistant,
          role: "assistant",
          content:
            "Estou em modo limitado e não consegui responder agora. Tente novamente em instantes.",
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
            <p className="atlas-page-eyebrow">Conversa</p>
            <h1>Atlas Intelligence</h1>
            <p>Pergunte sobre saldo, metas e contas</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={mostrarAtividade ? "secondary" : "ghost"}
          onClick={() => setMostrarAtividade((v) => !v)}
          aria-expanded={mostrarAtividade}
        >
          <Activity size={16} aria-hidden="true" />
          Atividade
        </Button>
      </header>

      {modoLimitado && (
        <p className="atlas-ai-limited-banner" role="status">
          Modo limitado ativo — respostas locais enquanto a IA online estiver indisponível ou
          acima do limite de uso.
        </p>
      )}

      {mostrarAtividade && (
        <div className="atlas-ai-activity">
          <IntelligenceFeed items={intelligence.feed} limit={8} compact />
        </div>
      )}

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
        <Input
          id="atlas-ai-input"
          type="text"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Pergunte algo..."
          autoComplete="off"
          disabled={enviando}
          aria-label="Mensagem para a Atlas IA"
        />
        <Button type="submit" size="sm" aria-label="Enviar mensagem" loading={enviando}>
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

export default AtlasAIPage;
