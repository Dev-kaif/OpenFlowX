import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Provider } from "jotai";

import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "OpenFlowX | Workflow Automation & Data Orchestration",
  description:
    "OpenFlowX is a modern platform for building, automating, and orchestrating workflows. Design powerful data flows, integrate services, and scale with ease.",
  keywords: [
    "workflow automation",
    "data orchestration",
    "ETL pipelines",
    "automation platform",
    "developer tools",
    "integration workflows",
    "flow-based programming",
    "OpenFlowX"
  ],
  authors: [{ name: "OpenFlowX Team" }],
  openGraph: {
    title: "OpenFlowX | Build & Orchestrate Workflows Visually",
    description:
      "Create scalable workflows and data pipelines with OpenFlowX. Open-source, developer-friendly, and built for modern systems.",
    url: "https://openflowx.dev",
    siteName: "OpenFlowX",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "OpenFlowX Workflow Automation Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenFlowX | Open-Source Workflow Automation",
    description:
      "Design, automate, and scale workflows with OpenFlowX. A modern flow-based automation platform for developers.",
    images: ["/og-preview.png"],
  },
  alternates: {
    canonical: "https://openflowx.dev",
  },
  icons: {
    icon: "/main/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Toaster />
                {children}
              </ThemeProvider>
            </Provider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
