"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10 max-h-screen overflow-y-hidden">
      <div className="relative flex w-full max-w-sm flex-col gap-6">

        {/* Ambient base glow */}
        <div
          className="pointer-events-none absolute -inset-24 rounded-full blur-[140px]
             bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.28),rgba(16,185,129,0.12),transparent_70%)]
             dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.22),rgba(16,185,129,0.1),transparent_75%)]"
        />

        {/* Soft focus glow */}
        <div
          className="pointer-events-none absolute -inset-10 rounded-full blur-[60px]
             bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),transparent_65%)]
             dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),transparent_70%)]"
        />


        <Link href="/" className="relative z-10 flex items-center justify-center">
          <Image
            alt="OpenFlowX"
            src={isDark ? "/main/logo-dark.png" : "/main/logo.png"}
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
