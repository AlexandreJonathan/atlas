import { Link } from "react-router-dom";
import { saudacaoPorHorario } from "../../lib/atlasIntelligenceCopy";
import "./HomeHeader.css";

type HomeHeaderProps = {
  nome?: string;
  email?: string;
};

function iniciais(nome: string | undefined, email: string | undefined): string {
  if (nome && nome.trim().length > 0) {
    const partes = nome.trim().split(/\s+/);
    const primeira = partes[0]?.[0] ?? "";
    const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
    return (primeira + ultima).toUpperCase();
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}

function HomeHeader({ nome, email }: HomeHeaderProps) {
  const primeiroNome = nome?.split(" ")[0];
  const saudacao = saudacaoPorHorario(new Date().getHours());

  return (
    <header className="atlas-home-header">
      <div className="atlas-home-header-text">
        <p className="atlas-home-header-eyebrow">Atlas</p>
        <h1>
          {saudacao}
          {primeiroNome ? `, ${primeiroNome}` : ""}.
        </h1>
      </div>
      <Link to="/perfil" className="atlas-home-header-avatar" aria-label="Abrir perfil">
        {iniciais(nome, email)}
      </Link>
    </header>
  );
}

export default HomeHeader;
