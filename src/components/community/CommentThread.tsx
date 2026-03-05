"use client";

import { useState } from "react";
import { CommentItem } from "./CommentItem";
import { Button } from "@/components/ui/Button";

interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  isAuthor: boolean;
}

interface CommentThreadProps {
  slug: string;
  comments: Comment[];
  isAuthenticated: boolean;
}

export function CommentThread({
  slug,
  comments: initialComments,
  isAuthenticated,
}: Readonly<CommentThreadProps>) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/packages/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([{ ...comment, isAuthor: false }, ...comments]);
        setBody("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post comment");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Comments ({comments.length})</h2>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Leave a comment..."
            className="w-full rounded-lg border border-glass-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-neon-cyan/30 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          <Button type="submit" size="sm" disabled={!body.trim() || loading} className="mt-2">
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No comments yet.</p>
      )}
    </div>
  );
}
