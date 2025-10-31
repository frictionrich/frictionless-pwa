import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { RegisterServiceWorker } from "./register-sw";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Frictionless - Startup Funding, Reimagined",
  description: "Instant Alignment for Founders and Investors. Matched. Measured. Monitored.",
  manifest: "/manifest.json",
  themeColor: "#28CB88",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
