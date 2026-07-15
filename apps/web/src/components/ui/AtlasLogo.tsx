import "./AtlasLogo.css";

type AtlasLogoProps = {
  size?: number;
  withWordmark?: boolean;
};

// Marca própria da Atlas — substitui o emoji 🚀 usado como "logo" antes
// desta missão. Monograma geométrico simples em SVG (sem depender de
// nenhum asset externo), nas cores de marca do Design System.
function AtlasLogo({ size = 40, withWordmark = true }: AtlasLogoProps) {
  return (
    <span className="atlas-logo">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="url(#atlas-logo-gradient)" />
        <path d="M20 10L28 28H23.5L20 19.5L16.5 28H12L20 10Z" fill="white" fillOpacity="0.95" />
        <defs>
          <linearGradient id="atlas-logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5b5fef" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
      {withWordmark && <span className="atlas-logo-wordmark">Atlas</span>}
    </span>
  );
}

export default AtlasLogo;
