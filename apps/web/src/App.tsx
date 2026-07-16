import { Navigate, Route, Routes } from "react-router-dom";

import ForgotPassword from "./components/ForgotPassword";
import AppShell from "./components/layout/AppShell";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import AccountsPage from "./pages/AccountsPage";
import AtlasAIPage from "./pages/AtlasAIPage";
import ConnectBanksPage from "./pages/ConnectBanksPage";
import ConnectedAccountsPage from "./pages/ConnectedAccountsPage";
import HomePage from "./pages/HomePage";
import InvestmentsPage from "./pages/InvestmentsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="/dashboard" element={<Navigate to="/inicio" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/contas" element={<AccountsPage />} />
        <Route path="/contas/conectar" element={<ConnectBanksPage />} />
        <Route path="/contas/conectadas" element={<ConnectedAccountsPage />} />
        <Route path="/investimentos" element={<InvestmentsPage />} />
        <Route path="/atlas-ia" element={<AtlasAIPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
