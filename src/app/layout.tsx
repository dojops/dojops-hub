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
    default: "DojOps Hub Skill Marketplace",
    template: "%s | DojOps Hub",
  },
  description:
    "Find and share .dops skills for DojOps. Open-source automation skills, ready to install.",
  keywords: ["DojOps", "DevOps", "skills", "marketplace", "automation", "infrastructure"],
  openGraph: {
    title: "DojOps Hub — Skill Marketplace",
    description:
      "Browse, install, and publish automation skills for DojOps. Terraform, Kubernetes, CI/CD, and more.",
    url: "https://hub.dojops.ai",
    siteName: "DojOps Hub",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DojOps Hub — Skill Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DojOps Hub — Skill Marketplace",
    description:
      "Browse, install, and publish automation skills for DojOps. Terraform, Kubernetes, CI/CD, and more.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://hub.dojops.ai",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://dojops.ai/#organization",
      name: "DojOps",
      url: "https://dojops.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://hub.dojops.ai/dojops-new-logo.png",
        width: 400,
        height: 400,
      },
      sameAs: ["https://github.com/dojops", "https://www.npmjs.com/package/@dojops/cli"],
    },
    {
      "@type": "WebApplication",
      "@id": "https://hub.dojops.ai/#webapp",
      name: "DojOps Hub",
      url: "https://hub.dojops.ai",
      description:
        "Browse, install, and publish DevOps automation skills for DojOps. Open-source marketplace for .dops skill files.",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "DevOps Skill Marketplace",
      operatingSystem: "Any (web-based)",
      provider: { "@id": "https://dojops.ai/#organization" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Browse and search DevOps skills",
        "One-command skill installation",
        "SHA-256 publisher attestation",
        "Community ratings and comments",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://hub.dojops.ai/#website",
      url: "https://hub.dojops.ai",
      name: "DojOps Hub",
      publisher: { "@id": "https://dojops.ai/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://hub.dojops.ai/explore?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD structured data — all values are static constants, no user input */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
