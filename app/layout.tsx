import type { Viewport } from "next";
import { display, mono, sans } from "@/components/fonts";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#09090c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://dgmhouse.com"),
  title: {
    default: "DGM HOUSE | #1 Web, App & Digital Marketing Agency in Chikkamagaluru",
    template: "%s | DGM HOUSE",
  },
  description:
    "Ranked as the top web development, mobile app, and digital marketing agency in Chikkamagaluru and Hassan. We build high-performance software and drive local business growth through expert SEO.",
  applicationName: "DGM HOUSE",
  authors: [{ name: "DGM HOUSE", url: "https://dgmhouse.com" }],
  generator: "Next.js",
  keywords: [
    "Web Development Agency Chikkamagaluru",
    "App Development Company Chikkamagaluru",
    "Digital Marketing Agency Chikkamagaluru",
    "Digital Marketing Hassan",
    "Web Design Hassan",
    "Software Development Agency Karnataka",
    "SEO Services Chikkamagaluru",
    "Social Media Marketing Hassan",
    "Ecommerce Development Chikkamagaluru",
    "React Native App Developers",
    "Next.js Agency",
    "DGM HOUSE",
  ],
  creator: "DGM HOUSE",
  publisher: "DGM HOUSE",
  alternates: {
    canonical: "https://dgmhouse.com",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://dgmhouse.com",
    siteName: "DGM HOUSE",
    title: "Top Web, App & Digital Marketing Agency in Chikkamagaluru & Hassan",
    description:
      "Looking for the best digital marketing and software development in Chikkamagaluru? DGM HOUSE specializes in custom web apps, mobile apps, and result-driven SEO for businesses in Hassan and Chikkamagaluru.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DGM HOUSE | #1 Digital Marketing & Web Agency in Chikkamagaluru",
    description:
      "The leading web development and digital marketing agency serving Chikkamagaluru and Hassan. We build scalable digital products and drive local business growth.",
  },
  icons: {
    icon: [
      { url: "/logo-full.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
  // Hyper-local SEO tags to force Google to associate the site with Chikkamagaluru & Hassan
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Chikkamagaluru",
    "geo.position": "13.3153;75.7754",
    "ICBM": "13.3153, 75.7754",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${display.variable} ${mono.variable} ${sans.variable} ${sans.className} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#09090c] text-[#ece9e0] selection:bg-[#c6ff2e] selection:text-[#09090c] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
