"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputFileButton,
  MessageInputSubmitButton,
  MessageInputTextarea,
  MessageInputToolbar,
} from "@/components/tambo/message-input";
import {
  MessageSuggestions,
  MessageSuggestionsList,
  MessageSuggestionsStatus,
} from "@/components/tambo/message-suggestions";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { ThreadContainer, useThreadContainerContext } from "./thread-container";
import { ThreadContent, ThreadContentMessages } from "@/components/tambo/thread-content";
import {
  ThreadHistory,
  ThreadHistoryHeader,
  ThreadHistoryHomeButton,
  ThreadHistoryList,
  ThreadHistoryNewButton,
  ThreadHistorySearch,
} from "@/components/tambo/thread-history";
import { useMergeRefs } from "@/lib/thread-hooks";
import type { Suggestion } from "@tambo-ai/react";
import { useTambo, useTamboThreadInput } from "@tambo-ai/react";
import type { VariantProps } from "class-variance-authority";
import { Sparkles } from "lucide-react";
import * as React from "react";

/**
 * Props for the MessageThreadFull component
 */
export interface MessageThreadFullProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof messageVariants>["variant"];
}

/**
 * Bolt.new inspired chat input component with animated gradient border
 */
function BoltChatInput() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Animated gradient border wrapper */}
      <div className="relative group">
        {/* Outer glow on focus/hover */}
        <div
          className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 opacity-0 blur-sm group-focus-within:opacity-75 group-hover:opacity-50 transition-all duration-500"
          style={{
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s ease infinite',
          }}
        />

        {/* Gradient border */}
        <div
          className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500/50 via-violet-500/50 to-blue-500/50 opacity-0 group-focus-within:opacity-100 group-hover:opacity-70 transition-opacity duration-300"
          style={{
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s ease infinite',
          }}
        />

        {/* Main input container */}
        <div className="relative rounded-xl bg-[#18181b] border border-zinc-800/80 group-focus-within:border-transparent group-hover:border-transparent transition-colors duration-300">
          <MessageInput className="!max-w-none !shadow-none [&>div]:!bg-transparent [&>div]:!border-none [&>div]:!rounded-xl [&>div]:!shadow-none">
            <MessageInputFileButton className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1" />
            <MessageInputTextarea
              placeholder="What do you want to explore?"
              className="text-zinc-100 placeholder:text-zinc-500 text-[15px] leading-relaxed"
            />
            <MessageInputToolbar>
              <MessageInputSubmitButton
                className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 mr-1"
              />
            </MessageInputToolbar>
            <MessageInputError />
          </MessageInput>
        </div>
      </div>

      {/* Global animation keyframes */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

/**
 * Suggestion card component - bolt.new style
 */
function SuggestionCard({
  icon,
  title,
  description,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-300 text-left"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-zinc-400 group-hover:text-blue-400 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
          {title}
        </span>
      </div>
      <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors leading-relaxed">
        {description}
      </p>
    </button>
  );
}

/**
 * Welcome screen with bolt.new inspired design
 */
function WelcomeScreen() {
  const { setValue, submit } = useTamboThreadInput();

  const handleSuggestionClick = React.useCallback((text: string) => {
    setValue(text);
    submit({ streamResponse: true });
  }, [setValue, submit]);

  const suggestions = [
    {
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
      title: "Find Floats",
      description: "Locate Argo floats in specific ocean regions",
    },
    {
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      title: "Temperature Profiles",
      description: "Analyze temperature data from float measurements",
    },
    {
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: "Network Statistics",
      description: "Get current status and statistics of the Argo network",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo and title */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 mb-6">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          LogPose
        </h1>
        <p className="text-zinc-400 text-base md:text-lg max-w-sm mx-auto">
          AI-powered ocean data exploration
        </p>
      </div>

      {/* Chat input */}
      <BoltChatInput />

      {/* Suggestion cards */}
      <div className="mt-10 w-full max-w-2xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.title}
              icon={suggestion.icon}
              title={suggestion.title}
              description={suggestion.description}
              onClick={() => handleSuggestionClick(suggestion.description)}
            />
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-8 text-xs text-zinc-600">
        Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Enter</kbd> to send
      </p>
    </div>
  );
}

/**
 * A full-screen chat thread component with message history, input, and suggestions
 */
export const MessageThreadFull = React.forwardRef<
  HTMLDivElement,
  MessageThreadFullProps
>(({ className, variant, ...props }, ref) => {
  const { containerRef, historyPosition } = useThreadContainerContext();
  const { thread } = useTambo();
  const mergedRef = useMergeRefs<HTMLDivElement | null>(ref, containerRef);

  const hasMessages =
    thread?.messages &&
    thread.messages.filter((m) => m.role !== "system").length > 0;

    const threadHistorySidebar = (
      <ThreadHistory position={historyPosition}>
        <ThreadHistoryHeader />
        <ThreadHistoryHomeButton />
        <ThreadHistoryNewButton />
        <ThreadHistorySearch />
        <ThreadHistoryList />
      </ThreadHistory>
    );

    const defaultSuggestions: Suggestion[] = [
      {
        id: "suggestion-1",
        title: "Active floats",
        detailedSuggestion: "Show me all active Argo floats in the network",
        messageId: "active-floats-query",
      },
      {
        id: "suggestion-2",
        title: "Network statistics",
        detailedSuggestion: "What's the current status of the Argo network?",
        messageId: "network-status-query",
      },
      {
        id: "suggestion-3",
        title: "Find floats",
        detailedSuggestion: "Find BGC floats in the Pacific Ocean",
        messageId: "find-floats-query",
      },
      {
        id: "suggestion-4",
        title: "Temperature data",
        detailedSuggestion: "Show temperature profiles for recent float measurements",
        messageId: "temperature-query",
      },
    ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Thread History Sidebar - rendered first if history is on the left */}
      {historyPosition === "left" && threadHistorySidebar}

      <ThreadContainer
        ref={mergedRef}
        disableSidebarSpacing
        className={className}
        {...props}
      >
        {hasMessages ? (
          <>
            <ScrollableMessageContainer className="p-4 mt-5">
              <ThreadContent variant={variant}>
                <ThreadContentMessages />
              </ThreadContent>
            </ScrollableMessageContainer>

            {/* Message suggestions status */}
            <MessageSuggestions>
              <MessageSuggestionsStatus />
            </MessageSuggestions>

            {/* Message input - bottom positioned when messages exist */}
            <div className="pb-6 w-full flex justify-center relative z-10">
              <BoltChatInput />
            </div>

            <MessageSuggestions initialSuggestions={defaultSuggestions}>
              <MessageSuggestionsList />
            </MessageSuggestions>
          </>
        ) : (
          <WelcomeScreen />
        )}
      </ThreadContainer>

          {/* Message input */}
          <div className="px-4 pb-4 max-w-3xl mx-auto w-full">
            <MessageInput>
              <MessageInputTextarea placeholder="Ask me anything......." />
              <MessageInputToolbar>
                <MessageInputFileButton />
                <MessageInputSubmitButton />
              </MessageInputToolbar>
              <MessageInputError />
            </MessageInput>
          </div>

          {/* Message suggestions - only show when there are messages */}
          {hasMessages && (
            <MessageSuggestions initialSuggestions={defaultSuggestions}>
              <MessageSuggestionsList />
            </MessageSuggestions>
      )}
        {/* Thread History Sidebar - rendered last if history is on the right */}
        {historyPosition === "right" && threadHistorySidebar}
      </div>
    );
  },
);
MessageThreadFull.displayName = "MessageThreadFull";
