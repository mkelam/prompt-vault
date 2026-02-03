import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/app/components/PWARegister";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://bizpromptvault.com";
const siteName = "BizPrompt Vault";
const siteDescription = "The Offline-First Enterprise Prompt Repository. 80+ enterprise-grade AI prompts for Strategy, Operations, Finance, HR, Sales, Project Management, and Business Analysis. Secure. Fast. Framework-Aligned.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "AI prompts",
    "enterprise prompts",
    "business prompts",
    "ChatGPT prompts",
    "Claude prompts",
    "SWOT analysis",
    "business strategy",
    "project management",
    "financial analysis",
    "HR prompts",
    "sales prompts",
    "offline AI tools",
    "prompt engineering",
    "business frameworks",
  ],
  authors: [{ name: "BizPrompt Vault" }],
  creator: "BizPrompt Vault",
  publisher: "BizPrompt Vault",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName: siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BizPrompt Vault - Enterprise AI Prompt Repository",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier with 25+ prompts. Premium tier available.",
  },
  featureList: [
    "80+ Enterprise AI Prompts",
    "Offline-First PWA",
    "Export to Excel & Markdown",
    "Variable Substitution",
    "Framework-Aligned Templates",
    "SWOT, Porter's Five Forces, BCG Matrix",
    "Strategy, Operations, Finance, HR, Sales",
  ],
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} circuit-bg min-h-screen text-white/90`}>
        <div className="fixed inset-0 bg-black/60 z-[-1]" />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
