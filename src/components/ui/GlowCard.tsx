import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
}

export function GlowCard({ children, className = "", as: Tag = "div" }: Readonly<GlowCardProps>) {
  return (
    <Tag
      className={`bg-bg-card border border-border-primary rounded-[14px] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:bg-bg-card-hover transition-all duration-200 ${className}`}
    >
      {children}
    </Tag>
  );
}
