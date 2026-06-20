import type { ButtonHTMLAttributes, ReactNode } from "react";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md";

type BtnProps = {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Btn({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...buttonProps
}: BtnProps) {
  const base =
    "inline-flex items-center gap-1.5 font-medium rounded-lg transition-all whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary:   "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/70",
    ghost:     "text-muted-foreground hover:bg-muted hover:text-foreground",
    danger:    "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

export default Btn;
