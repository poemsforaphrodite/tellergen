import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Teller Gen AI - Hyper-Realistic Voice Synthesis",
  description: "Welcome to Teller Gen AI — The ultimate AI platform for creating hyper-realistic human and celebrity voices. Create lifelike voiceovers and bring your projects to life with cutting-edge voice synthesis technology.",
  keywords: ["AI voice synthesis", "celebrity voices", "hyper-realistic voiceovers", "voice cloning", "text-to-speech"],
  openGraph: {
    title: "Teller Gen AI - Hyper-Realistic Voice Synthesis",
    description: "Create lifelike voiceovers and bring your projects to life with cutting-edge AI voice synthesis technology.",
    url: "https://tellergen.com",
    siteName: "Teller Gen AI",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teller Gen AI - Hyper-Realistic Voice Synthesis",
    description: "Create lifelike voiceovers and bring your projects to life with cutting-edge AI voice synthesis technology.",
  },
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
        {children}
      </body>
    </html>
  );
}
