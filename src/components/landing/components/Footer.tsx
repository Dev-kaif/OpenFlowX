import { Github, Twitter } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

export const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className="relative mt-32 border-t border-border bg-background">
      {/* Soft fade from content */}
      <div className="absolute inset-x-0 -top-24 h-24 bg-linear-to-t from-background to-transparent pointer-events-none" />

      <div className="container px-10 py-14">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand block */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Image
              alt="OpenFlowX"
              src={isDark ? "/main/logo-dark.png" : "/main/logo.png"}
              width={110}
              height={36}
              className="h-9 w-auto"
            />
            <p className="text-sm text-muted-foreground max-w-md text-center md:text-left leading-relaxed">
              Open-source workflow orchestration for AI models, APIs, and event-driven systems.
            </p>
          </div>

          {/* Social */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Dev-kaif/OpenFlowX"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} OpenFlowX</span>
          <span>Built for developers</span>
        </div>
      </div>
    </footer>
  );
};
