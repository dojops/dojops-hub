import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "cyan" | "amber" | "red" | "green";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-bg-secondary text-text-secondary",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  error: "bg-error-bg text-error-fg",
  // Legacy aliases — map to semantic tokens
  cyan: "bg-accent-subtle text-accent-text",
  amber: "bg-warning-bg text-warning-fg",
  red: "bg-error-bg text-error-fg",
  green: "bg-success-bg text-success-fg",
};

export function Badge({ children, variant = "default", className = "" }: Readonly<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
