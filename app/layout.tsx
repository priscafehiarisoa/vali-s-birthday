import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { Bagel_Fat_One, Caveat, Fredoka } from "next/font/google";
import content from "@/lib/content";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
};

export const viewport: Viewport = {
  themeColor: content.theme.background,
};

const { theme } = content;
const themeVars = {
  "--c-bg": theme.background,
  "--c-bg-alt": theme.backgroundAlt,
  "--c-primary": theme.primary,
  "--c-primary-dark": theme.primaryDark,
  "--c-secondary": theme.secondary,
  "--c-accent": theme.accent,
  "--c-text": theme.text,
} as CSSProperties;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${caveat.variable} ${bagel.variable} h-full antialiased`} style={themeVars}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
