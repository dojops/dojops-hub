import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-glass-border bg-bg-deep">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Hub</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Explore Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/publish"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Publish
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">DojOps</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://dojops.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Website
                </a>
              </li>
              <li>
                <a
                  href="https://doc.dojops.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Community</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://github.com/dojops"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Install</h3>
            <div className="mt-3">
              <code className="rounded bg-surface px-2 py-1 font-mono text-xs text-neon-cyan-dim">
                npm i -g @dojops/cli
              </code>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-glass-border pt-6">
          <p className="text-center text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} DojOps. MIT License. Created by{" "}
            <a
              href="https://github.com/MHChlagou"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-neon-cyan transition-colors duration-200"
            >
              Mohamed Hedi CHLAGOU
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
