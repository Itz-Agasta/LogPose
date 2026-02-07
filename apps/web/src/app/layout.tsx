import type { Metadata } from "next";

import "../index.css";
import Providers from "@/components/providers";

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
      <body className="font-sans antialiased">
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
