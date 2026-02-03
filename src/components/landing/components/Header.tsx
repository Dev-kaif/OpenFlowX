"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
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
  const [open, setOpen] = useState(false);

  // ✅ Always run hooks unconditionally
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Scroll lock for mobile menu
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const handleScroll = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(id);
    if (!el) return;
    const y =
      el.getBoundingClientRect().top +
      window.scrollY -
      HEADER_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        {/* HEADER BAR */}
        <div className="container relative flex h-16 items-center justify-between px-4 md:px-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              alt="OpenFlowX"
              src={isDark ? "/main/logo-dark.png" : "/main/logo.png"}
              width={120}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {/* GitHub (desktop) */}
            <Button variant="ghost" size="sm" className="hidden md:flex gap-2" asChild>
              <a href="https://github.com/Dev-kaif/OpenFlowX" target="_blank">
                <Image
                  src={isDark ? "/Logos/github-dark.svg" : "/Logos/github.svg"}
                  width={14}
                  height={14}
                  alt="GitHub"
                />
                GitHub
              </a>
            </Button>
            {/* CTA (desktop) */}
            <Link href="/signUp" className="hidden md:block">
              <Button className="bg-linear-to-r from-[hsl(168,76%,42%)] via-[hsl(160,82%,35%)] to-[hsl(156,68%,28%)]">
                Get Started
              </Button>
            </Link>
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU PANEL (attached to header) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-full inset-x-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-lg"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-sm font-medium text-foreground"
                  >
                    {item.label}
                  </a>
                ))}
                <Link href="/signUp" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-linear-to-r from-[hsl(168,76%,42%)] via-[hsl(160,82%,35%)] to-[hsl(156,68%,28%)]">
                    Get Started
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="flex gap-2" asChild>
                  <a href="https://github.com/Dev-kaif/OpenFlowX" target="_blank">
                    <Image
                      src={isDark ? "/Logos/github-dark.svg" : "/Logos/github.svg"}
                      width={14}
                      height={14}
                      alt="GitHub"
                    />
                    GitHub
                  </a>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* BACKDROP BLUR - Full screen overlay that blocks clicks */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            style={{ top: HEADER_HEIGHT }} // Start below header
          />
        )}
      </AnimatePresence>
    </>
  );
};