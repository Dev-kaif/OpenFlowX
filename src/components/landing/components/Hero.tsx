import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";

export const Hero = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none
                   opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none hidden dark:block
                   opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-flow-pulse" />
            <span className="text-sm text-muted-foreground">
              Open Source AI Orchestration
            </span>
          </div>

          {/* Icon */}
          <div
            className="flex justify-center mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <Image
              alt="OpenFlowX"
              className="h-20 w-auto"
              width={120}
              height={40}
              src={"/main/favicon.png"}
              priority
            />
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in text-balance"
            style={{ animationDelay: "0.2s" }}
          >
            Orchestrate AI Workflows Across{" "}
            <span className="gradient-text">
              Models, APIs, and Events
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in text-balance"
            style={{ animationDelay: "0.3s" }}
          >
            Build, connect, and control AI-powered workflows using multiple LLMs,
            APIs, and event triggers all in one visual orchestration engine.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href={"/signUp"} prefetch>
              <Button
                size="lg"
                className="bg-linear-to-r from-[hsl(168,76%,42%)] via-[hsl(160,82%,35%)] to-[hsl(156,68%,28%)]
              text-primary-foreground hover:opacity-90 transition-opacity
              gap-2 px-8 h-12 text-base"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-4 h-12 text-base border-border hover:bg-muted"
              asChild
            >
              <a
                href="https://github.com/Dev-kaif/OpenFlowX"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image className="h-5 w-fit" height={10} width={10} alt="github" src={isDark ? "/Logos/github-dark.svg" : "/Logos/github.svg"} />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
};
