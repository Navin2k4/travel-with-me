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
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism, shadcn } from '@clerk/ui/themes'

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
        <ClerkProvider
          appearance={{
            theme: shadcn,
          }}
        >

          {/* {https://clerk.com/components/theme-editor?config=eyJ0aGVtZSI6ImRlZmF1bHQiLCJ2YXJpYWJsZXMiOnsibGlnaHQiOnsiY29sb3JQcmltYXJ5IjoiIzJGMzAzNyIsImNvbG9yUHJpbWFyeUZvcmVncm91bmQiOiIjZmZmZmZmIiwiY29sb3JEYW5nZXIiOiIjRUY0NDQ0IiwiY29sb3JTdWNjZXNzIjoiIzIyQzU0MyIsImNvbG9yV2FybmluZyI6IiNGMzZCMTYiLCJjb2xvck5ldXRyYWwiOiIjMDAwMDAwIiwiY29sb3JGb3JlZ3JvdW5kIjoiIzAwMDAwMCIsImNvbG9yTXV0ZWRGb3JlZ3JvdW5kIjoiIzc0NzY4NiIsImNvbG9yQmFja2dyb3VuZCI6IiNmZmZmZmYiLCJjb2xvcklucHV0IjoiI2ZmZmZmZiIsImNvbG9ySW5wdXRGb3JlZ3JvdW5kIjoiIzAwMDAwMCIsImNvbG9yUmluZyI6IiMwMDAwMDAiLCJjb2xvclNoaW1tZXIiOiIjZmZmZmZmIiwiY29sb3JNb2RhbEJhY2tkcm9wIjoiIzAwMDAwMCIsImJvcmRlclJhZGl1cyI6Im1kIiwic3BhY2luZyI6Im1kIn0sImRhcmsiOnsiY29sb3JQcmltYXJ5IjoiIzdDQ0YwMCIsImNvbG9yUHJpbWFyeUZvcmVncm91bmQiOiIjMDAwMDAwIiwiY29sb3JEYW5nZXIiOiIjRUY0NDQ0IiwiY29sb3JTdWNjZXNzIjoiIzIyQzU0MyIsImNvbG9yV2FybmluZyI6IiNGMzZCMTYiLCJjb2xvck5ldXRyYWwiOiIjRkZGRkZGIiwiY29sb3JGb3JlZ3JvdW5kIjoiI0ZGRkZGRiIsImNvbG9yTXV0ZWRGb3JlZ3JvdW5kIjoiIzc0NzY4NiIsImNvbG9yQmFja2dyb3VuZCI6IiMwMDAwMDAiLCJjb2xvcklucHV0IjoiI2ZmZmZmZiIsImNvbG9ySW5wdXRGb3JlZ3JvdW5kIjoiIzAwMDAwMCIsImNvbG9yUmluZyI6IiMwMDAwMDAiLCJjb2xvclNoaW1tZXIiOiIjZmZmZmZmIiwiY29sb3JNb2RhbEJhY2tkcm9wIjoiIzdDQ0YwMCIsImJvcmRlclJhZGl1cyI6Im1kIiwic3BhY2luZyI6Im1kIiwiY29sb3JNdXRlZCI6IiMwMDAwMDAiLCJjb2xvckJvcmRlciI6IiM3Q0NGMDAiLCJjb2xvclNoYWRvdyI6IiM3Q0NGMDAifX19 } */}
          <Providers>
            <div className="min-h-screen">
              <ChromeShell header={<Header />} footer={<AuthFooter />}>
                {children}
              </ChromeShell>
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
