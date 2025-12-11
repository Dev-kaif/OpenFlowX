import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
