import type { HTMLAttributes } from "react";
import "./Card.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
  glow?: boolean;
  padding?: "sm" | "md" | "lg";
};

// Container premium base de todos os painéis/cards do Dashboard 2.0 — ver
// roadmap/design-system.md.
function Card({ elevated = false, glow = false, padding = "md", className, children, ...rest }: CardProps) {
  const classes = [
    "atlas-card",
    `atlas-card-padding-${padding}`,
    elevated ? "atlas-card-elevated" : "",
    glow ? "atlas-card-glow" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export default Card;
