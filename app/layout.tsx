import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Miden Private Notes Lab",
  description: "Explore private notes and client-side proving with the official Miden Web SDK.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Miden Private Notes Lab",
    description: "Explore private notes and client-side proving with the official Miden Web SDK.",
    images: [{ url: "/social-card.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miden Private Notes Lab",
    description: "Explore private notes and client-side proving with the official Miden Web SDK.",
    images: ["/social-card.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
