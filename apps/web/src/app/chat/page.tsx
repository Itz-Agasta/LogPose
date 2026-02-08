"use client";

import { ChatContainer } from "@/components/tambo/chat-container";
import { ModeToggle } from "@/components/mode-toggle";
import { IconAnchor, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import { TamboProvider, useTamboThread } from "@tambo-ai/react";
import { components, tools as baseTools } from "@/lib/tambo";

// Component to handle thread switching and URL sync
function ChatContent({ threadId }: { threadId: string | null }) {
  const { thread, switchCurrentThread } = useTamboThread();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Switch to thread from URL if provided
  useEffect(() => {
    if (threadId && thread?.id !== threadId) {
      switchCurrentThread(threadId);
    }
  }, [threadId, thread?.id, switchCurrentThread]);

  // Sync URL with current thread
  useEffect(() => {
    if (thread?.id && thread.id !== threadId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("threadId", thread.id);
      router.replace(`/chat?${params.toString()}`, { scroll: false });
    }
  }, [thread?.id, threadId, searchParams, router]);

  return (
    <div className="relative flex flex-col h-svh font-sans">
      {/* Chat Interface */}
      <ChatContainer
        showSidebar={true}
        suggestions={[
          {
            title: "Active floats",
            message: "Show me all active Argo floats in the network",
          },
          {
            title: "Network statistics",
            message: "What's the current status of the Argo network?",
          },
          {
            title: "Find floats",
            message: "Find BGC floats in the Pacific Ocean",
          },
          {
            title: "Temperature data",
            message: "Show temperature profiles for recent float measurements",
          },
        ]}
      />
    </div>
  );
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const floatId = searchParams.get("floatId");
  const threadId = searchParams.get("threadId");
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY ?? "";

  const contextTools = useMemo(() => {
    if (!floatId) return baseTools;

    return baseTools.map((tool) => {
      if (
        tool.name === "query-float-metadata" ||
        tool.name === "query-oceanographic-profiles"
      ) {
        return {
          ...tool,
          tool: async (args: any) => {
            return tool.tool({ ...args, floatId });
          },
        };
      }
      return tool;
    });
  }, [floatId]);

  const contextComponents = useMemo(() => {
    if (!floatId) return components;

    return components.map((component) => {
      if (component.name === "RenderFloatGraph") {
        const OriginalComponent = component.component;
        return {
          ...component,
          component: (props: any) => {
            const enhancedProps = {
              ...props,
              floatId: props.floatId ?? floatId,
            };
            return <OriginalComponent {...enhancedProps} />;
          },
        };
      }
      if (component.name === "FloatDataCard") {
        const OriginalComponent = component.component;
        return {
          ...component,
          component: (props: any) => {
            const enhancedProps = {
              ...props,
              floatId: props.floatId ?? floatId,
            };
            return <OriginalComponent {...enhancedProps} />;
          },
        };
      }
      if (component.name === "FloatLocationMap") {
        const OriginalComponent = component.component;
        return {
          ...component,
          component: (props: any) => {
            let locations = props.locations;
            if (locations && Array.isArray(locations)) {
              locations = locations.map((loc: any) => ({
                ...loc,
                floatId: loc.floatId ?? floatId,
              }));
            }

            const enhancedProps = {
              ...props,
              locations,
            };
            return <OriginalComponent {...enhancedProps} />;
          },
        };
      }
      return component;
    });
  }, [floatId]);

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
          <Link href="/home">
            <Button variant="outline">
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (floatId) {
    return (
      <TamboProvider
        apiKey={apiKey}
        contextKey={floatId}
        components={contextComponents}
        tools={contextTools}
      >
        <ChatContent threadId={threadId} />
      </TamboProvider>
    );
  }

  return (
    <TamboProvider
      apiKey={apiKey}
      components={components}
      tools={baseTools}
    >
      <ChatContent threadId={threadId} />
    </TamboProvider>
  );
}
