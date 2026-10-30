import Link from "next/link";
import { Sparkles, Terminal, Youtube, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-card/20 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold text-sm">TechPulse</p>
            <p className="text-xs text-muted-foreground">
              Autonomous AI intelligence for engineers & builders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/archive" className="hover:text-foreground transition-colors">
            Archive
          </Link>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Youtube className="w-3.5 h-3.5" />
            Source Playlists
          </a>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} TechPulse. Powered by Gemini.
        </p>
      </div>
    </footer>
  );
}

