import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-card rounded-xl border border-border shadow-sm ${className}`}>{children}</div>;
}

export default Card;
