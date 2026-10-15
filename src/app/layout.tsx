import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ocupai",
  description: "The AI operating system for modern property.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/ocupai-logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.className} ${inter.variable} ${outfit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
