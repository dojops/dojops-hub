import { Badge } from "@/components/ui/Badge";

interface PermissionBadgesProps {
  permissions: Record<string, string> | null;
}

const icons: Record<string, string> = {
  filesystem: "FS",
  child_process: "Exec",
  network: "Net",
};

export function PermissionBadges({ permissions }: Readonly<PermissionBadgesProps>) {
  if (!permissions) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(permissions).map(([key, value]) => {
        if (value === "none") return null;
        const variant = key === "network" || key === "child_process" ? "amber" : "cyan";
        return (
          <Badge key={key} variant={variant}>
            {icons[key] || key}: {value}
          </Badge>
        );
      })}
    </div>
  );
}
