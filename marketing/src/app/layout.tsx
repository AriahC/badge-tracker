import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import {
  AnnouncementBar,
  SiteFooter,
  SiteHeader,
} from "@/components/Chrome";
import { site } from "@/lib/copy";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: "Meet Veya, created by girls for growing minds.",
    description:
      "Help shape a more joyful way for Girl Scouts to track badges, adventures, and everything they are learning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable}`}>
        <AnnouncementBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
