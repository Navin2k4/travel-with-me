import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Noto_Sans } from "next/font/google";

import { AuthFooter } from "@/components/auth/auth-footer";
import Header from "@/components/header";
import { ChromeShell } from "@/components/layout/chrome-shell";
import Providers from "@/components/providers";
import "../index.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel With Me",
  description:
    "Personal finance tracker: accounts, assets, loans, investments, and net worth.",
};

import { cn } from "@/lib/utils";

const notoSansHeading = Noto_Sans({ subsets: ['latin'], variable: '--font-heading' });

const roboto = Roboto({ subsets: ['latin'], variable: '--font-sans' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        geistSans.variable,
        geistMono.variable,
        roboto.variable,
        notoSansHeading.variable
      )}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen">
            <ChromeShell header={<Header />} footer={<AuthFooter />}>
              {children}
            </ChromeShell>
          </div>
        </Providers>
      </body>
    </html>
  );
}
