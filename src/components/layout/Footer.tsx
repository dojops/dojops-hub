import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-primary">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-xs font-semibold text-text-primary sm:text-sm">Hub</h3>
            <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
              <li>
                <Link
                  href="/explore"
                  className="text-xs text-accent-text hover:text-text-primary transition-colors sm:text-sm"
                >
                  Explore Modules
                </Link>
              </li>
              <li>
                <Link
                  href="/publish"
                  className="text-xs text-accent-text hover:text-text-primary transition-colors sm:text-sm"
                >
                  Publish
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-primary sm:text-sm">DojOps</h3>
            <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
              <li>
                <a
                  href="https://dojops.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-text hover:text-text-primary transition-colors sm:text-sm"
                >
                  Website
                </a>
              </li>
              <li>
                <a
                  href="https://doc.dojops.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-text hover:text-text-primary transition-colors sm:text-sm"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-primary sm:text-sm">Community</h3>
            <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
              <li>
                <a
                  href="https://github.com/dojops"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent-text hover:text-text-primary transition-colors sm:text-sm"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-text-primary sm:text-sm">Install</h3>
            <div className="mt-2 sm:mt-3">
              <code className="rounded-sm bg-bg-card px-2 py-1 font-mono text-[10px] text-text-secondary sm:text-xs">
                npm i -g @dojops/cli
              </code>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-border-primary pt-4 sm:mt-8 sm:pt-6">
          <p className="text-center text-[10px] text-text-secondary sm:text-xs">
            &copy; {new Date().getFullYear()} DojOps. MIT License.
            <br className="sm:hidden" /> Created by{" "}
            <a
              href="https://github.com/MHChlagou"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-text hover:text-text-primary transition-colors"
            >
              Mohamed Hedi CHLAGOU
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
