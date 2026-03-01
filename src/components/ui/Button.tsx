import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary:
    "bg-neon-cyan text-bg-deep font-semibold hover:bg-neon-cyan-dim shadow-[0_0_20px_rgba(0,229,255,0.2)]",
  secondary:
    "border border-glass-border bg-surface-elevated text-text-primary hover:border-glass-border-hover hover:shadow-[var(--glow-cyan)]",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center transition-all ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
