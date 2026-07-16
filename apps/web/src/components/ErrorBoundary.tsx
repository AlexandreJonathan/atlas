import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "../lib/logging";
import AtlasLogo from "./ui/AtlasLogo";
import Button from "./ui/Button";
import "./ErrorBoundary.css";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Boundary global: captura exceções de render não tratadas e exibe
 * fallback elegante sem derrubar a árvore inteira fora deste wrapper.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("Exceção não tratada na UI", error, {
      componentStack: info.componentStack,
    });
  }

  private handleGoHome = (): void => {
    this.setState({ hasError: false });
    window.location.assign("/inicio");
  };

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="atlas-error-boundary" role="alert">
          <div className="atlas-error-boundary-card">
            <AtlasLogo size={48} withWordmark />
            <h1>Algo saiu do roteiro</h1>
            <p>
              Encontramos um erro inesperado. Você pode voltar para a Home e continuar de onde
              parou — seus dados estão seguros.
            </p>
            <div className="atlas-error-boundary-actions">
              <Button fullWidth onClick={this.handleGoHome}>
                Voltar para a Home
              </Button>
              <Button fullWidth variant="secondary" onClick={this.handleRetry}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
