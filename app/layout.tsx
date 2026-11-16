import type { Metadata, Viewport } from "next";
import { display, mono, sans } from "@/components/fonts";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#09090c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dgmhouse.com"),
  title: {
    default: "DGM HOUSE — Software Development Agency",
    template: "%s | DGM HOUSE",
  },
  description:
    "We architect & scale mission-critical web applications, cloud architectures, AI systems, and digital products that scale without breaking.",
  applicationName: "DGM HOUSE",
  authors: [{ name: "DGM HOUSE", url: "https://dgmhouse.com" }],
  generator: "Next.js",
  keywords: [
    "Software Development Agency",
    "Full-Stack Development",
    "Next.js Agency",
    "Cloud Architecture",
    "AI Systems & LLMs",
    "Enterprise Web Applications",
    "React Native",
    "DGM HOUSE",
  ],
  creator: "DGM HOUSE",
  publisher: "DGM HOUSE",
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
    locale: "en_US",
    url: "https://dgmhouse.com",
    siteName: "DGM HOUSE",
    title: "DGM HOUSE - Software Development Agency",
    description:
      "From zero-to-one architecture to hyper-scale cloud infrastructure, we partner with visionary founders and enterprises to engineer mission-critical solutions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DGM HOUSE — Software Development Agency",
    description:
      "We architect & scale mission-critical software systems that scale without breaking.",
  },
  icons: {
    icon: [
      { url: "/logo-full.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icon.svg" }],
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
