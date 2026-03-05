import { Badge } from "@/components/ui/Badge";

const riskVariants = {
  LOW: "green",
  MEDIUM: "amber",
  HIGH: "red",
} as const;

export function RiskBadge({ level }: Readonly<{ level: string }>) {
  const variant = riskVariants[level as keyof typeof riskVariants] || "default";
  return <Badge variant={variant}>{level}</Badge>;
}
