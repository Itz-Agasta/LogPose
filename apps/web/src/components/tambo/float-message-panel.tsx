"use client";

import { useTambo, useTamboThread, TamboProvider } from "@tambo-ai/react";
import { X, MessageSquare, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatThread } from "@/components/tambo/chat-thread";
import { ChatInput } from "@/components/tambo/chat-input";
import { cn } from "@/lib/utils";
import * as React from "react";
import { components, tools as baseTools } from "@/lib/tambo";
import { useParams } from "next/navigation";
import { FloatDisplayContext } from "@/components/profile/float-display-context";

interface FloatMessagePanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  floatId?: string | number;
}

export function FloatMessagePanel({
  isOpen,
  onClose,
  className,
  floatId,
}: FloatMessagePanelProps) {
  const urlParams = useParams();
  const floatIdFromPath = Array.isArray(urlParams?.floatId)
    ? urlParams.floatId[0]
    : urlParams?.floatId;
  const derivedFloatId = floatId || floatIdFromPath;

  const floatContext = React.useContext(FloatDisplayContext);
  const metadata = floatContext?.metadata;

  const contextHelpers = React.useMemo(() => {
    if (!metadata) return undefined;
    return {
      floatMetadata: () => ({
        ...metadata,
        floatId: derivedFloatId,
      }),
    };
  }, [metadata, derivedFloatId]);

  const contextTools = React.useMemo(() => {
    if (!derivedFloatId) return baseTools;

    return baseTools.map((tool) => {
      if (
        tool.name === "query-float-metadata" ||
        tool.name === "query-oceanographic-profiles"
      ) {
        return {
          ...tool,
          tool: async (args: any) => {
            return tool.tool({ ...args, floatId: derivedFloatId });
          },
        };
      }
      return tool;
    });
  }, [derivedFloatId]);

  const contextComponents = React.useMemo(() => {
    if (!derivedFloatId) return components;

    return components.map((component) => {
      const { name } = component;

      if (name === "RenderFloatGraph" || name === "FloatDataCard") {
        const OriginalComponent = component.component;
        return {
          ...component,
          component: React.memo((props: any) => {
            const enhancedProps = {
              ...props,
              floatId: props.floatId ?? derivedFloatId,
            };
            return <OriginalComponent {...enhancedProps} />;
          }),
        };
      }

      if (name === "FloatLocationMap") {
        const OriginalComponent = component.component;
        return {
          ...component,
          component: React.memo((props: any) => {
            const locations = props.locations?.map((loc: any) => ({
              ...loc,
              floatId: loc.floatId ?? derivedFloatId,
            }));

            return <OriginalComponent {...props} locations={locations} />;
          }),
        };
      }

      return component;
    });
  }, [derivedFloatId]);

  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY || "";

  return (
    <TamboProvider
      apiKey={apiKey}
      contextKey={derivedFloatId ? String(derivedFloatId) : undefined}
      components={contextComponents}
      tools={contextTools}
      contextHelpers={contextHelpers}
      initialMessages={undefined}
    >
      <FloatMessagePanelContent
        isOpen={isOpen}
        onClose={onClose}
        className={className}
        floatId={derivedFloatId}
      />
    </TamboProvider>
  );
}

function FloatMessagePanelContent({
  isOpen,
  onClose,
  className,
  floatId,
}: FloatMessagePanelProps) {
  const { thread, isIdle } = useTamboThread();
  const hasMessages = thread?.messages && thread.messages.length > 0;
  const isGenerating = !isIdle;
  const currentThreadId = thread?.id;

  // Resizable panel state
  const [panelWidth, setPanelWidth] = React.useState(512); // 32rem = 512px
  const [isResizing, setIsResizing] = React.useState(false);
  const minWidth = 320; // 20rem
  const maxWidth = 800; // 50rem

  // Handle resize
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  // Optional: Set initial context or suggestions based on floatId if needed
  const suggestions = React.useMemo(
    () =>
      floatId
        ? [
          {
            title: "Float Status",
            message: `What is the current status of float ${floatId}?`,
          },
          {
            title: "Temperature Profile",
            message: `Show me the temperature profile for float ${floatId}.`,
          },
          {
            title: "Location",
            message: `Where is float ${floatId} located right now?`,
          },
        ]
        : [
          {
            title: "Active floats",
            message: "Show me all active Argo floats in the network",
          },
          {
            title: "Network statistics",
            message: "What's the current status of the Argo network?",
          },
        ],
    [floatId]
  );

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-screen bg-background border-l border-border shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        isResizing && "transition-none",
        className,
      )}
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize handle */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors",
          isResizing && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      />

      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Poseidon</h2>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={currentThreadId ? `/chat?threadId=${currentThreadId}` : "/chat"}
            target="_blank"
            title="Open in new window"
          >
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `
                  radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)
                `,
            backgroundSize: "32px 32px",
          }}
        />

        {hasMessages ? (
          <>
            <ChatThread className="flex-1 p-4" />
            <div className="p-4 bg-background border-t border-border">
              <ChatInput
                suggestions={undefined}
                showSuggestions={false}
                className="w-full"
                floatId={floatId}
                placeholder={
                  floatId ? `Ask about Float ${floatId}...` : "Ask anything..."
                }
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 space-y-6">
            <ChatInput
              suggestions={suggestions}
              showSuggestions={true}
              className="w-full"
              floatId={floatId}
              placeholder={
                floatId ? `Ask about Float ${floatId}...` : "Ask anything..."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
