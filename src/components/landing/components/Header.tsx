"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const HEADER_HEIGHT = 64;

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Community", href: "#community" },
];

export const Header = () => {

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between px-10">
        {/* Logo */}
        <motion.div
          whileHover={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3"
        >
          <Image
            alt="OpenFlowX"
            className="h-10 w-auto"
            width={120}
            height={40}
            src={isDark ? "/main/logo-dark.png" : "/main/logo.png"}
            priority
          />
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={(e) => handleScroll(e, item.href)}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15 }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <motion.div whileTap={{ rotate: 90 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* GitHub */}
          <motion.div whileHover={{ y: -1 }}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              asChild
            >
              <a
                href="https://github.com/Dev-kaif/OpenFlowX"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image className="h-4 w-fit" height={10} width={10} alt="github" src={isDark ? "/Logos/github-dark.svg" : "/Logos/github.svg"} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </motion.div>

          {/* CTA */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={"/signUp"} prefetch>
              <Button
                size="sm"
                className="bg-linear-to-r from-[hsl(168,76%,42%)] via-[hsl(160,82%,35%)] to-[hsl(156,68%,28%)] text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};
