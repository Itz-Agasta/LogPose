"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { ChatThread } from "./chat-thread";
import { ChatInput } from "./chat-input";
import { useTamboThread } from "@tambo-ai/react";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryHomeButton,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
  ThreadHistoryList,
} from "./thread-history";
import { Menu, X } from "lucide-react";

/**
 * Props for the ChatContainer component
 */
export interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the sidebar */
  showSidebar?: boolean;
  /** Custom suggestions for the input */
  suggestions?: Array<{ title: string; message: string }>;
}

/**
 * Complete chat interface with sidebar, messages, and input
 */
export const ChatContainer = React.forwardRef<
  HTMLDivElement,
  ChatContainerProps
>(({ className, showSidebar = true, suggestions, ...props }, ref) => {
  const { thread } = useTamboThread();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const hasMessages = thread?.messages && thread.messages.length > 0;

  return (
    <div
      ref={ref}
      className={cn("flex h-full w-full bg-background", className)}
      {...props}
    >
      {/* Mobile sidebar toggle */}
      {showSidebar && (
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "fixed top-4 left-4 z-50 p-2 rounded-lg",
            "bg-background border border-border",
            "text-muted-foreground hover:text-foreground",
            "shadow-sm hover:shadow-md",
            "transition-all duration-200",
            "lg:hidden",
          )}
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar content */}
          <div
            className={cn(
              "fixed lg:relative inset-y-0 left-0 z-40",
              "w-64 bg-muted/30 border-r border-border",
              "transform transition-transform duration-200 ease-in-out",
              "lg:transform-none",
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0",
            )}
          >
            <ThreadHistory position="left" defaultCollapsed={false}>
              <ThreadHistoryHeader className="mb-2" />
              <ThreadHistoryHomeButton />
              <ThreadHistoryNewButton />
              <ThreadHistorySearch />
              <div className="flex-1 overflow-y-auto">
                <ThreadHistoryList />
              </div>
            </ThreadHistory>
          </div>
        </>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
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
        />

        {/* Input area - centered at bottom, or centered in middle when no messages */}
        <div
          className={cn(
            "relative z-10 w-full",
            !hasMessages
              ? "flex-1 flex flex-col justify-center"
              : "sticky bottom-0 bg-linear-to-t from-background via-background to-transparent pt-6",
          )}
        >
          <ChatInput suggestions={suggestions} showSuggestions={!hasMessages} />

          {/* Bottom padding when has messages */}
          {hasMessages && <div className="h-4" />}
        </div>
      </div>
    </div>
  );
});
ChatContainer.displayName = "ChatContainer";

export default ChatContainer;
