import type { Metadata } from "next";
import favicon from "@/favicon.ico";


import Header from "@/components/header";
import Providers from "@/components/providers";
import "../index.css";
import { AuthFooter } from "@/components/auth/auth-footer";

export const metadata: Metadata = {
  title: "Travel With Me",
  description: "Travel With Me",
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
    apple: favicon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body className={`antialiased`}>
        <Providers>
          <div className="min-h-screen">
            <Header />
            <div>{children}</div>
          </div>
          <AuthFooter />
        </Providers>
      </body>
    </html>
  );
}
