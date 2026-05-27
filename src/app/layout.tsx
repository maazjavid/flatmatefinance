import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FlatMate Finance",
  description: "Shared household expense tracking for flatmates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` on <body> silences mismatches caused by
    // browser extensions (e.g. ColorZilla's `cz-shortcut-listen` attribute)
    // injecting attributes before React hydrates. It doesn't suppress real
    // React hydration bugs — those still log from inner components.
    <html lang="en">
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
