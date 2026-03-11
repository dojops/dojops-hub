import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface UserProfileProps {
  user: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
    createdAt: Date;
  };
  starCount: number;
}

export function UserProfile({ user, starCount }: Readonly<UserProfileProps>) {
  return (
    <div className="flex items-start gap-6">
      {user.avatarUrl && (
        <Image
          src={user.avatarUrl}
          alt={user.username}
          width={80}
          height={80}
          className="rounded-full border border-border-primary"
        />
      )}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">
            {user.displayName || user.username}
          </h1>
          {user.role === "ADMIN" && <Badge variant="cyan">Admin</Badge>}
        </div>
        <p className="text-text-secondary">@{user.username}</p>
        {user.bio && <p className="mt-2 max-w-lg text-sm text-text-secondary">{user.bio}</p>}
        <div className="mt-3 flex items-center gap-4 text-sm text-text-secondary">
          <Link href={`/users/${user.username}/stars`} className="hover:text-text-primary">
            {starCount} starred
          </Link>
          <span>
            Joined{" "}
            {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
              new Date(user.createdAt),
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
