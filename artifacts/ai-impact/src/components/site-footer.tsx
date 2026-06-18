import { Link } from "wouter";

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border mt-12 pt-6 pb-2 text-xs text-muted-foreground text-center ${className}`}
    >
      Designed by Dana Milstein Santoscoy, PhD, ACC. © 2026. All rights
      reserved.{" "}
      <Link href="/about" className="text-primary hover:underline">
        See Terms
      </Link>
      {" · "}
      <a
        href="https://github.com/danamilstein/ai-impact-tracker"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        View source
      </a>
      .
    </footer>
  );
}
