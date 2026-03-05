import Image from "next/image";
import Link from "next/link";
import { AuthorBadge } from "./AuthorBadge";
import { timeAgo } from "@/lib/utils";

interface CommentItemProps {
  comment: {
    id: string;
    body: string;
    createdAt: Date;
    user: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
    isAuthor: boolean;
  };
}

export function CommentItem({ comment }: Readonly<CommentItemProps>) {
  return (
    <div className="rounded-lg border border-glass-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/users/${comment.user.username}`} className="flex items-center gap-2">
          {comment.user.avatarUrl && (
            <Image
              src={comment.user.avatarUrl}
              alt={comment.user.username}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span className="text-sm font-medium text-text-primary">
            {comment.user.displayName || comment.user.username}
          </span>
        </Link>
        {comment.isAuthor && <AuthorBadge />}
        <span className="text-xs text-text-secondary">{timeAgo(comment.createdAt)}</span>
      </div>
      <p className="text-sm text-text-secondary whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}
