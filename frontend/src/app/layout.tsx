import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { LocalAuthProvider } from "@/context/LocalAuthContext";
import { CompareProvider } from "@/context/CompareContext";
import { CompareTray } from "@/components/CompareTray";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Explainable Recommender",
  description:
    "AI-powered recommendations you can trust — Content, Collaborative, Context-aware.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10px_10px,theme(colors.purple.200)_2px,transparent_2px)] [background-size:24px_24px]" />
        <LocalAuthProvider>
          <CompareProvider>
            <Header />
            {children}
            <CompareTray />
          </CompareProvider>
        </LocalAuthProvider>
      </body>
    </html>
  );
}
