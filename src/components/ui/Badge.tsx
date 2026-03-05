import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "cyan" | "amber" | "red" | "green";
  className?: string;
}

const variantStyles = {
  default: "border-glass-border text-text-secondary",
  cyan: "border-neon-cyan/20 text-neon-cyan bg-neon-cyan/5",
  amber: "border-amber-500/20 text-amber-400 bg-amber-500/5",
  red: "border-red-500/20 text-red-400 bg-red-500/5",
  green: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
};

export function Badge({ children, variant = "default", className = "" }: Readonly<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
