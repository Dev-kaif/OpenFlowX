"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex max-w-md flex-col items-center text-center"
        >

            {/* Soft ambient glow */}
            <div
                className="pointer-events-none absolute -inset-24 rounded-full blur-[140px]
        bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.22),rgba(16,185,129,0.10),transparent_70%)]
        dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),rgba(16,185,129,0.08),transparent_75%)]"
            />

            {/* Content */}
            <div className="relative z-10 flex max-w-md flex-col items-center text-center">
                {/* 404 */}
                <h1 className="text-[96px] font-extrabold leading-none tracking-tight gradient-text">
                    404
                </h1>

                {/* Title */}
                <h2 className="mt-2 text-2xl font-semibold">
                    Page not found
                </h2>

                {/* Description */}
                <p className="mt-3 text-sm text-muted-foreground">
                    The page you’re looking for doesn’t exist or was moved.
                    Let’s get you back on track.
                </p>

                {/* Actions */}
                <div className="mt-8 flex items-center gap-3">
                    <Link href="/" prefetch>
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Go home
                        </Button>
                    </Link>

                    <Link href="/signUp" prefetch>
                        <Button
                            className="bg-linear-to-r from-[hsl(168,76%,42%)] via-[hsl(160,82%,35%)] to-[hsl(156,68%,28%)] text-primary-foreground hover:opacity-90"
                        >
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
