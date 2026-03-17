import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
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
    default: "DojOps Hub — Skill Marketplace",
    template: "%s | DojOps Hub",
  },
  description:
    "Find and share .dops skills for DojOps. Open-source DevOps automation skills, ready to install.",
  keywords: ["DojOps", "DevOps", "skills", "marketplace", "automation", "infrastructure"],
  icons: { icon: "/dojops-favicon.png" },
  openGraph: {
    title: "DojOps Hub — Skill Marketplace",
    description:
      "Browse, install, and publish DevOps automation skills for DojOps. Terraform, Kubernetes, CI/CD, and more.",
    url: "https://hub.dojops.ai",
    siteName: "DojOps Hub",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/dojops-favicon.png",
        width: 128,
        height: 128,
        alt: "DojOps Hub — Skill Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "DojOps Hub — Skill Marketplace",
    description:
      "Browse, install, and publish DevOps automation skills for DojOps. Terraform, Kubernetes, CI/CD, and more.",
    images: ["/dojops-favicon.png"],
  },
  alternates: {
    canonical: "https://hub.dojops.ai",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){document.documentElement.classList.add("dark");}})();`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased ambient-glow noise-overlay`}
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
