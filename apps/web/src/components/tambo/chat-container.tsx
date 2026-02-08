"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { ChatThread } from "./chat-thread";
import { ChatInput } from "./chat-input";
import { useTamboThread } from "@tambo-ai/react";
import { ChatSidebar } from "./chat-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Props for the ChatContainer component
 */
export interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the sidebar */
  showSidebar?: boolean;
  /** Custom suggestions for the input */
  suggestions?: Array<{ title: string; message: string }>;
  /** Whether the thread is currently being switched */
  isSwitchingThread?: boolean;
}

/**
 * Complete chat interface with sidebar, messages, and input
 */
export const ChatContainer = React.forwardRef<
  HTMLDivElement,
  ChatContainerProps
>(({ className, showSidebar = true, suggestions, isSwitchingThread = false, ...props }, ref) => {
  const { thread } = useTamboThread();
  const hasMessages = thread?.messages && thread.messages.length > 0;
  const showEmptyState = !hasMessages && !isSwitchingThread;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
      className={cn("h-full w-full", className)}
    >
      {showSidebar && <ChatSidebar />}
      <SidebarInset className="h-full overflow-hidden flex flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `
                  radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)
                `,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Thread area - expands to fill space when no messages */}
          <ChatThread
            className={cn("relative z-10", !hasMessages && "flex-none")}
            isSwitchingThread={isSwitchingThread}
          />

          {/* Input area - centered at bottom, or centered in middle when no messages */}
          <div
            className={cn(
              "relative z-10 w-full",
              showEmptyState
                ? "flex-1 flex flex-col justify-center items-center"
                : "bg-linear-to-t from-background via-background to-transparent pt-6",
            )}
          >
            <ChatInput suggestions={suggestions} showSuggestions={showEmptyState} isSwitchingThread={isSwitchingThread} />

            {/* Bottom padding when has messages */}
            {hasMessages && <div className="h-4" />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
});
ChatContainer.displayName = "ChatContainer";

export default ChatContainer;
