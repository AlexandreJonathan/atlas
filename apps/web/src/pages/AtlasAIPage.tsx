import { BrainCircuit, Send } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  MOCK_ATLAS_AI_MESSAGES,
  MOCK_ATLAS_AI_REPLY,
  type AtlasAiMessage,
} from "../data/mockAtlasAiChat";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import "./AtlasAIPage.css";

function AtlasAIPage() {
  const [mensagens, setMensagens] = useState<AtlasAiMessage[]>(MOCK_ATLAS_AI_MESSAGES);
  const [texto, setTexto] = useState("");

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;

    const idUser = `local-user-${Date.now()}`;
    const idAssistant = `local-assistant-${Date.now()}`;

    setMensagens((atual) => [
      ...atual,
      { id: idUser, role: "user", content: conteudo },
      { id: idAssistant, role: "assistant", content: MOCK_ATLAS_AI_REPLY },
    ]);
    setTexto("");
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
        <Badge tone="informativa">Prévia simulada — IA real em breve</Badge>
      </header>

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

      <form className="atlas-ai-composer" onSubmit={handleSubmit}>
        <label className="atlas-sr-only" htmlFor="atlas-ai-input">
          Mensagem para a Atlas IA
        </label>
        <input
          id="atlas-ai-input"
          type="text"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Pergunte algo (resposta simulada)..."
          autoComplete="off"
        />
        <Button type="submit" size="sm" aria-label="Enviar mensagem">
          <Send size={16} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

export default AtlasAIPage;
