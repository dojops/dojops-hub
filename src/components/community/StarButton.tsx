"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface StarButtonProps {
  slug: string;
  initialStarred: boolean;
  initialCount: number;
}

export function StarButton({ slug, initialStarred, initialCount }: StarButtonProps) {
  const { data: session } = useSession();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!session) return;
    setLoading(true);

    // Capture previous values for revert
    const prevStarred = starred;
    const prevCount = count;

    // Optimistic update
    setStarred(!prevStarred);
    setCount(prevStarred ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/packages/${slug}/star`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStarred(data.starred);
        setCount(data.starCount);
      } else {
        // Revert on failure
        setStarred(prevStarred);
        setCount(prevCount);
      }
    } catch {
      setStarred(prevStarred);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={starred ? "primary" : "secondary"}
      size="sm"
      onClick={handleToggle}
      disabled={!session || loading}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={starred ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className="mr-1.5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {starred ? "Starred" : "Star"} ({count})
    </Button>
  );
}
