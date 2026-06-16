import { ReactNode } from "react";

export function Btn({
  children, onClick, variant = "primary", size = "md", className = "", type = "button",
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md"; className?: string; type?: "button" | "submit";
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary:   "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/70",
    ghost:     "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger:    "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export default Btn;
