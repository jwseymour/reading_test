import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
  Source_Sans_3,
  Source_Serif_4,
} from "next/font/google";
import { Providers } from "@/components/shell/Providers";
import { AppNav } from "@/components/shell/AppNav";
import { DisclaimerBanner } from "@/components/shell/DisclaimerBanner";
import { GlobalStopButton } from "@/components/shell/GlobalStopButton";
import { SessionLengthNudge } from "@/components/shell/SessionLengthNudge";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/opendyslexic/700.css";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PerceptLab",
  description:
    "Personal visual-perception self-assessment toolkit — not a diagnostic device.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${ibmMono.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <DisclaimerBanner compact />
          <AppNav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <div className="global-stop no-print">
            <GlobalStopButton />
          </div>
          <div className="no-print">
            <SessionLengthNudge />
          </div>
        </Providers>
      </body>
    </html>
  );
}
