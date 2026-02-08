import { Work_Sans } from "next/font/google";
import type { Metadata } from "next";

import "../index.css";
import Providers from "@/components/providers";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "LogPose",
  description: "LogPose",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${workSans.variable} font-sans antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
