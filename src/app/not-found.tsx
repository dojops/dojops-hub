import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gradient-cyan">404</h1>
      <p className="mt-4 text-lg text-text-secondary">Page not found</p>
      <Link href="/" className="mt-6">
        <Button variant="secondary">Back to Home</Button>
      </Link>
    </div>
  );
}
