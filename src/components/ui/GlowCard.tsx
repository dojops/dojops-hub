import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article";
}

export function GlowCard({ children, className = "", as: Tag = "div" }: Readonly<GlowCardProps>) {
  return (
    <Tag className={`glow-card rounded-xl border border-glass-border bg-surface p-6 ${className}`}>
      {children}
    </Tag>
  );
}
