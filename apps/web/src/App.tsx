import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const ConnectBanksPage = lazy(() => import("./pages/ConnectBanksPage"));
const ConnectedAccountsPage = lazy(() => import("./pages/ConnectedAccountsPage"));
const InvestmentsPage = lazy(() => import("./pages/InvestmentsPage"));
const AtlasAIPage = lazy(() => import("./pages/AtlasAIPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SmartGoalsPage = lazy(() =>
  import("./modules/smart-goals").then((m) => ({ default: m.SmartGoalsPage })),
);

function PageFallback() {
  return <div className="atlas-page-loader">Carregando...</div>;
}

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
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
          <Route path="/metas" element={<SmartGoalsPage />} />
          <Route path="/atlas-ia" element={<AtlasAIPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
