import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/inter/wght.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { appConfig } from "./config";
import { AuthProvider } from "./contexts/AuthContext";
import { initSentry, logger } from "./lib/logging";
import "./styles/tokens.css";
import "./index.css";
import App from "./App.tsx";

async function bootstrap() {
  await initSentry();

  logger.info("Atlas boot", {
    version: appConfig.version,
    env: appConfig.env,
    providers: appConfig.providers,
    featureFlags: appConfig.featureFlags,
    sentry: Boolean(appConfig.observability.sentryDsn),
  });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>,
  );
}

void bootstrap();
