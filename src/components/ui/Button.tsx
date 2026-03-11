import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variants = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-[var(--shadow-sm)]",
  secondary: "bg-bg-card text-text-primary border border-border-primary hover:bg-bg-card-hover",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover",
  danger: "bg-error-fg text-white hover:opacity-90",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-[38px] px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-all ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
