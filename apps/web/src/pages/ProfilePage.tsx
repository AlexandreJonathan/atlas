import {
  Bell,
  ChevronRight,
  Landmark,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import "./AccountsPage.css";
import "./ProfilePage.css";

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

function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);

  const nome = (user?.user_metadata?.nome as string | undefined) ?? "Usuário Atlas";
  const email = user?.email ?? "";

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  }

  return (
    <div className="atlas-page">
      <header className="atlas-page-header">
        <div>
          <h1>Perfil</h1>
          <p>Conta, segurança e preferências</p>
        </div>
      </header>

      <main className="atlas-page-main">
        <Card elevated className="atlas-profile-card">
          <div className="atlas-profile-avatar" aria-hidden="true">
            {iniciais(nome, email)}
          </div>
          <div className="atlas-profile-identity">
            <h2>{nome}</h2>
            <p>{email}</p>
            <Badge tone="neutra">Plano Atlas Free</Badge>
          </div>
        </Card>

        <Card elevated className="atlas-page-section">
          <ul className="atlas-profile-menu">
            <li>
              <Link to="/esqueci-senha" className="atlas-profile-menu-item">
                <span className="atlas-profile-menu-label">
                  <Shield size={18} aria-hidden="true" />
                  Segurança
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </li>
            <li>
              <div className="atlas-profile-menu-item">
                <span className="atlas-profile-menu-label">
                  <Bell size={18} aria-hidden="true" />
                  Notificações
                </span>
                <label className="atlas-profile-toggle">
                  <span className="atlas-sr-only">Ativar notificações (em breve)</span>
                  <input
                    type="checkbox"
                    checked={notificacoesAtivas}
                    onChange={(evento) => setNotificacoesAtivas(evento.target.checked)}
                    disabled
                    title="Em breve"
                  />
                  <Badge tone="neutra">Em breve</Badge>
                </label>
              </div>
            </li>
            <li>
              <div className="atlas-profile-menu-item atlas-profile-menu-item-static">
                <span className="atlas-profile-menu-label">
                  <Settings size={18} aria-hidden="true" />
                  Configurações
                </span>
                <Badge tone="neutra">Em breve</Badge>
              </div>
            </li>
            <li>
              <Link to="/contas" className="atlas-profile-menu-item">
                <span className="atlas-profile-menu-label">
                  <Landmark size={18} aria-hidden="true" />
                  Open Finance
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </Card>

        <Button variant="danger" fullWidth onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Sair
        </Button>
      </main>
    </div>
  );
}

export default ProfilePage;
