import { Bot, CreditCard, Home, TrendingUp, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./BottomNavigation.css";

const ABAS = [
  { to: "/inicio", label: "Início", icon: Home },
  { to: "/contas", label: "Contas", icon: CreditCard },
  { to: "/investimentos", label: "Investir", icon: TrendingUp },
  { to: "/atlas-ia", label: "IA", icon: Bot },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

function BottomNavigation() {
  return (
    <nav className="atlas-bottom-nav" aria-label="Navegação principal">
      {ABAS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to !== "/contas"}
          className={({ isActive }) =>
            `atlas-bottom-nav-item${isActive ? " atlas-bottom-nav-item-active" : ""}`
          }
        >
          <Icon size={22} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNavigation;
