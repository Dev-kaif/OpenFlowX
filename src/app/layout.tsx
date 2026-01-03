import type { Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Provider } from "jotai";

import "./globals.css";

export const metadata: Metadata = {
  title: "N8N",
  description: "N8N is a powerful workflow automation tool that allows you to connect various services and automate tasks with ease.",
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
              <Toaster />
              {children}
            </Provider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
