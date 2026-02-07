"use client";

import { TamboProvider } from "@tambo-ai/react";
import { components, tools } from "@/lib/tambo";
import { ModeToggle } from "@/components/mode-toggle";
import { IconAnchor, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageThreadFull } from "@/components/tambo";

export default function ChatPage() {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY ?? "";

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <IconAnchor className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Configuration Required</h2>
          <p className="text-muted-foreground mb-4">
            Please set the{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
              NEXT_PUBLIC_TAMBO_API_KEY
            </code>{" "}
            environment variable to enable the chat interface.
          </p>
          <Link href="/">
            <Button variant="outline">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <TamboProvider apiKey={apiKey} components={components} tools={tools}>
      <div className="relative flex flex-col h-svh">
        {/* Floating Mode Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ModeToggle />
        </div>

        {/* Tambo Message Thread */}
        <div className="flex-1 h-full w-full overflow-hidden">
          <MessageThreadFull />
        </div>
      </div>
    </TamboProvider>
  );
}
