"use client";

import { cn } from "@/lib/utils";
import {
  type TamboThreadMessage,
  useTambo,
  GenerationStage,
} from "@tambo-ai/react";
import * as React from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Message,
  MessageContent,
  MessageImages,
  MessageRenderedComponentArea,
  ReasoningInfo,
  ToolcallInfo,
} from "@/components/tambo/message";

/**
 * Props for the ChatGPT-style thread component
 */
export interface ChatThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional welcome component to show when no messages */
  welcomeComponent?: React.ReactNode;
  /** Whether the thread is currently being switched */
  isSwitchingThread?: boolean;
}

/**
 * Individual message component styling
 */
interface ChatMessageProps {
  message: TamboThreadMessage;
  isLoading?: boolean;
}

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, isLoading }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const isAssistant = message.role === "assistant";

    const handleCopy = React.useCallback(async () => {
      const textContent = Array.isArray(message.content)
        ? message.content
          .filter(
            (part): part is { type: "text"; text: string } =>
              part.type === "text",
          )
          .map((part) => part.text)
          .join("\n")
        : String(message.content || "");

      if (textContent) {
        await navigator.clipboard.writeText(textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }, [message.content]);

    return (
      <div
        ref={ref}
        className={cn(
          "group w-full",
          "py-6",
          "border-b border-border/50 last:border-b-0",
        )}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-4">
            {/* Message content */}
            <div className="flex-1 min-w-0">
              {/* Actual message using existing Message component */}
              <Message
                role={isAssistant ? "assistant" : "user"}
                message={message}
                isLoading={isLoading}
                className="flex w-full"
              >
                <div className="flex flex-col w-full">
                  <ReasoningInfo />
                  <MessageImages />
                  <MessageContent
                    className={cn(
                      "text-foreground prose prose-sm dark:prose-invert max-w-none",
                      "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
                      "[&_ul]:my-2 [&_ol]:my-2",
                      "[&_li]:my-0.5",
                      "[&_pre]:my-3 [&_pre]:rounded-lg [&_pre]:bg-muted/50",
                      "[&_code]:text-sm [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
                    )}
                  />
                  <ToolcallInfo />
                  <MessageRenderedComponentArea className="w-full mt-4" />
                </div>
              </Message>

              {/* Action buttons for assistant messages */}
              {isAssistant && !isLoading && (
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={cn(
                      "p-1.5 rounded-md",
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted",
                      "transition-colors duration-150",
                    )}
                    title="Copy message"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-1.5 rounded-md",
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted",
                      "transition-colors duration-150",
                    )}
                    title="Regenerate response"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
ChatMessage.displayName = "ChatMessage";

/**
 * Loading indicator that matches ChatGPT's thinking animation
 */
const ThinkingIndicator = () => {
  return (
    <div className="w-full py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loading indicator for streaming responses
 */
const StreamingSkeletonIndicator = () => {
  return (
    <div className="w-full py-6 border-b border-border/50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for thread switching
 */
const ThreadSwitchingSkeleton = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8">
      <div className="max-w-3xl w-full space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Message thread with centered layout and modern design
 */
export const ChatThread = React.forwardRef<HTMLDivElement, ChatThreadProps>(
  ({ className, welcomeComponent, isSwitchingThread = false, ...props }, ref) => {
    const { thread, generationStage, isIdle } = useTambo();
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [shouldAutoscroll, setShouldAutoscroll] = React.useState(true);
    const lastScrollTopRef = React.useRef(0);

    // Forward ref
    React.useImperativeHandle(ref, () => scrollContainerRef.current!, []);

    const messages = React.useMemo(
      () =>
        (thread?.messages ?? []).filter(
          (msg) => msg.role !== "system" && !msg.parentMessageId,
        ),
      [thread?.messages],
    );

    const isGenerating = !isIdle;
    const isStreaming = generationStage === GenerationStage.STREAMING_RESPONSE;

    // Handle scroll events
    const handleScroll = React.useCallback(() => {
      if (!scrollContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 8;

      if (scrollTop < lastScrollTopRef.current) {
        setShouldAutoscroll(false);
      } else if (isAtBottom) {
        setShouldAutoscroll(true);
      }

      lastScrollTopRef.current = scrollTop;
    }, []);

    // Auto-scroll effect
    React.useEffect(() => {
      if (
        scrollContainerRef.current &&
        shouldAutoscroll &&
        messages.length > 0
      ) {
        const scroll = () => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: isStreaming ? "auto" : "smooth",
            });
          }
        };

        if (isStreaming) {
          requestAnimationFrame(scroll);
        } else {
          const timeoutId = setTimeout(scroll, 50);
          return () => clearTimeout(timeoutId);
        }
      }
    }, [messages, isStreaming, shouldAutoscroll]);

    const hasMessages = messages.length > 0;

    return (
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto",
          "[&::-webkit-scrollbar]:w-[6px]",
          "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          className,
        )}
        {...props}
      >
        {/* Show loading skeleton when switching threads */}
        {isSwitchingThread ? (
          <ThreadSwitchingSkeleton />
        ) : hasMessages ? (
          <div className="min-h-full">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id ?? `${message.role}-${index}`}
                message={message}
                isLoading={isGenerating && index === messages.length - 1}
              />
            ))}

            {/* Show thinking indicator when waiting for response */}
            {isGenerating &&
              messages[messages.length - 1]?.role === "user" &&
              generationStage !== GenerationStage.STREAMING_RESPONSE && (
                <ThinkingIndicator />
              )}

            {/* Show skeleton when streaming response */}
            {isGenerating &&
              generationStage === GenerationStage.STREAMING_RESPONSE &&
              messages[messages.length - 1]?.role === "user" && (
                <StreamingSkeletonIndicator />
              )}

            {/* Bottom padding */}
            <div className="h-32" />
          </div>
        ) : (
          /* Welcome component or empty state */
          welcomeComponent || null
        )}
      </div>
    );
  },
);
ChatThread.displayName = "ChatThread";

export { ChatMessage };
