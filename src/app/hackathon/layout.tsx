import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./hackathon.css";

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
  title: "Veya — Hackathon Demo",
  description:
    "Veya helps Girl Scout families track badge adventures and mint permanent digital badges. Open the waitlist or try the live app demo.",
  openGraph: {
    title: "Veya — Hackathon Demo",
    description:
      "One link for judges: Founding Family waitlist + live Badge Journey app demo.",
  },
};

export default function HackathonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`hackathon ${fraunces.variable} ${dmSans.variable}`}>
      {children}
    </div>
  );
}
