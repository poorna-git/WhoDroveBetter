import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhoDroveBetter 🏎️ | Friendly Car Competition",
  description: "Log every car you've ever driven, compete on leaderboards, and find out who drove better.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF4444",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-bg text-text pb-20 md:pb-0">
        <SessionProvider>
          <Navigation />
          <main className="max-w-4xl mx-auto px-4 py-6">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
