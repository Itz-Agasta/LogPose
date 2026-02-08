"use client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { TamboProvider } from "@tambo-ai/react";
import { components, tools } from "@/lib/tambo";

export default function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_TAMBO_API_KEY is not set. Chat features will be disabled.");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TamboProvider
        apiKey={apiKey || ""}
        components={components}
        tools={tools}
      >
        {children}
        <Toaster richColors />
      </TamboProvider>
    </ThemeProvider>
  );
}
