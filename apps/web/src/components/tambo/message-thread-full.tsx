"use client";

import type { messageVariants } from "@/components/tambo/message";
import {
  MessageInput,
  MessageInputError,
  MessageInputFileButton,
  MessageInputMcpPromptButton,
  MessageInputMcpResourceButton,
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
import {
  ThreadContent,
  ThreadContentMessages,
} from "@/components/tambo/thread-content";
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
import { IconAnchor, IconMap, IconChartLine, IconDatabase, IconWaveSine } from "@tabler/icons-react";
import * as React from "react";

/**
 * Props for the MessageThreadFull component
 */
export interface MessageThreadFullProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: VariantProps<typeof messageVariants>["variant"];
}

/**
 * Abstract orb/wave visualization component
 */
function AbstractOrb() {
  return (
    <div className="relative w-64 h-48 mb-6">
      {/* Outer glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />

      {/* Wave lines */}
      <svg
        viewBox="0 0 200 150"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Multiple wave paths creating an orb-like effect */}
        <ellipse cx="100" cy="75" rx="80" ry="60" stroke="url(#waveGradient)" strokeWidth="0.5" fill="none" opacity="0.3" />
        <ellipse cx="100" cy="75" rx="70" ry="52" stroke="url(#waveGradient)" strokeWidth="0.5" fill="none" opacity="0.4" />
        <ellipse cx="100" cy="75" rx="60" ry="44" stroke="url(#waveGradient)" strokeWidth="0.5" fill="none" opacity="0.5" />
        <ellipse cx="100" cy="75" rx="50" ry="36" stroke="url(#waveGradient)" strokeWidth="0.5" fill="none" opacity="0.6" />
        <ellipse cx="100" cy="75" rx="40" ry="28" stroke="url(#waveGradient)" strokeWidth="0.7" fill="none" opacity="0.7" />
        <ellipse cx="100" cy="75" rx="30" ry="20" stroke="url(#waveGradient)" strokeWidth="0.8" fill="none" opacity="0.8" />

        {/* Horizontal wave lines */}
        <path d="M20,75 Q60,55 100,75 T180,75" stroke="url(#waveGradient)" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M20,85 Q60,65 100,85 T180,85" stroke="url(#waveGradient)" strokeWidth="0.8" fill="none" opacity="0.5" />
        <path d="M20,65 Q60,45 100,65 T180,65" stroke="url(#waveGradient)" strokeWidth="0.8" fill="none" opacity="0.5" />

        {/* Center highlight */}
        <circle cx="100" cy="75" r="15" fill="url(#waveGradient)" opacity="0.15" />
      </svg>
    </div>
  );
}

/**
 * Suggestion card component with gradient background
 */
function SuggestionCard({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-start p-4 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] text-left min-h-[100px]"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />
      <div className="absolute inset-[1px] rounded-xl border border-primary/20 group-hover:border-primary/40 transition-colors" />

      {/* Content */}
      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium mb-3">
          <Icon className="h-3 w-3" />
          {label}
        </span>
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {description}
        </p>
      </div>
    </button>
  );
}

/**
 * Welcome screen component shown when there are no messages
 */
function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    {
      icon: IconMap,
      label: "Float Locations",
      description: "Show me floats in the Bay of Bengal",
    },
    {
      icon: IconChartLine,
      label: "Data Analysis",
      description: "Temperature profile for a specific float",
    },
    {
      icon: IconDatabase,
      label: "Statistics",
      description: "How many active floats are deployed?",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 relative">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        {/* Abstract Orb */}
        <AbstractOrb />

        {/* Greeting */}
        <div className="w-full text-start mb-8">
          <h1 className="text-3xl md:text-4xl text-foreground mb-2">
            Hey! <span className="text-primary">Explorer</span>
          </h1>
          <p className="text-2xl md:text-3xl font-light text-muted-foreground">
            What can I help with?
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.label}
              icon={suggestion.icon}
              label={suggestion.label}
              description={suggestion.description}
              onClick={() => onSuggestionClick(suggestion.description)}
            />
          ))}
        </div>
      </div>
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
  const { setValue, submit } = useTamboThreadInput();
  const mergedRef = useMergeRefs<HTMLDivElement | null>(ref, containerRef);

  const hasMessages = thread?.messages && thread.messages.filter(m => m.role !== "system").length > 0;

  const handleSuggestionClick = React.useCallback((text: string) => {
    setValue(text);
    submit({ streamResponse: true });
  }, [setValue, submit]);

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
      detailedSuggestion:
        "Show temperature profiles for recent float measurements",
      messageId: "temperature-query",
    },
  ];

  return (
    <div className="flex h-full w-full">
      {/* Thread History Sidebar - rendered first if history is on the left */}
      {historyPosition === "left" && threadHistorySidebar}

      <ThreadContainer
        ref={mergedRef}
        disableSidebarSpacing
        className={className}
        {...props}
      >
        <ScrollableMessageContainer className="p-4">
          {hasMessages ? (
            <ThreadContent variant={variant}>
              <ThreadContentMessages />
            </ThreadContent>
          ) : (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          )}
        </ScrollableMessageContainer>

        {/* Message suggestions status */}
        <MessageSuggestions>
          <MessageSuggestionsStatus />
        </MessageSuggestions>

        {/* Message input */}
        <div className="px-4 pb-4 max-w-3xl mx-auto w-full">
          <MessageInput>
            <MessageInputTextarea placeholder="Ask me anything......." />
            <MessageInputToolbar>
              <MessageInputFileButton />
              <MessageInputMcpPromptButton />
              <MessageInputMcpResourceButton />
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
      </ThreadContainer>

      {/* Thread History Sidebar - rendered last if history is on the right */}
      {historyPosition === "right" && threadHistorySidebar}
    </div>
  );
});
MessageThreadFull.displayName = "MessageThreadFull";
