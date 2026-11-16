import { Unbounded, JetBrains_Mono, DM_Sans } from "next/font/google";

// Shared by layout, Hero, Navbar, Process, and Projects so each font loads once
export const display = Unbounded({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
