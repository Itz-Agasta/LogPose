"use client";

import { useTambo, useTamboThread } from "@tambo-ai/react";
import { X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatThread } from "@/components/tambo/chat-thread";
import { ChatInput } from "@/components/tambo/chat-input";
import { cn } from "@/lib/utils";
import * as React from "react";

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
    const { thread } = useTamboThread();
    const hasMessages = thread?.messages && thread.messages.length > 0;

    // Optional: Set initial context or suggestions based on floatId if needed
    const suggestions = floatId
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
        ];

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed right-0 top-0 h-screen w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col",
                className
            )}
        >
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
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

                <ChatThread
                    className="flex-1 p-4"
                    welcomeComponent={
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">How can I help?</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Ask questions about {floatId ? `float ${floatId}` : "Argo floats"}, data, or oceanography.
                                </p>
                            </div>
                        </div>
                    }
                />

                <div className="p-4 bg-background border-t border-border">
                    <ChatInput
                        suggestions={!hasMessages ? suggestions : undefined}
                        showSuggestions={!hasMessages}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
}
