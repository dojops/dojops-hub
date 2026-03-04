import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hub.dojops.ai"),
  title: {
    default: "DojOps Hub — Module Marketplace",
    template: "%s | DojOps Hub",
  },
  description:
    "Discover, publish, and install .dops DevOps modules for DojOps. The community marketplace for AI-powered infrastructure automation.",
  keywords: ["DojOps", "DevOps", "modules", "marketplace", "automation", "infrastructure"],
  icons: { icon: "/dojops-favicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sora.variable} ${jetbrainsMono.variable} antialiased ambient-glow noise-overlay`}
      >
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
