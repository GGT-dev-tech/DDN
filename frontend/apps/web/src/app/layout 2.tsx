import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { DevTools } from "@/devtools";

export const metadata: Metadata = {
  title: "GoAuct Intelligence OS",
  description: "Operational system for waste management",
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
        <ErrorBoundary>
          <Providers>
            {children}
            <DevTools />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
