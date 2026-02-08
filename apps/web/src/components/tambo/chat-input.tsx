"use client";

import { cn } from "@/lib/utils";
import {
  useTamboThread,
  useTamboThreadInput,
  type StagedImage,
} from "@tambo-ai/react";
import {
  useTamboElicitationContext,
  type TamboElicitationRequest,
  type TamboElicitationResponse,
} from "@tambo-ai/react/mcp";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import * as React from "react";
import { ElicitationUI } from "@/components/tambo/elicitation-ui";

/**
 * Context for the ChatGPT-style input
 */
interface ChatInputContextValue {
  value: string;
  setValue: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  images: StagedImage[];
  addImages: (images: File[]) => void;
  removeImage: (id: string) => void;
  submitError: string | null;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
  imageError: string | null;
  setImageError: React.Dispatch<React.SetStateAction<string | null>>;
  elicitation: TamboElicitationRequest | null;
  resolveElicitation: ((response: TamboElicitationResponse) => void) | null;
  cancel: () => void;
}

const ChatInputContext = React.createContext<ChatInputContextValue | null>(
  null,
);

const useChatInputContext = () => {
  const context = React.useContext(ChatInputContext);
  if (!context) {
    throw new Error("ChatInput sub-components must be used within a ChatInput");
  }
  return context;
};

const MAX_IMAGES = 5;

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps extends React.HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  suggestions?: Array<{ title: string; message: string }>;
  showSuggestions?: boolean;
  floatId?: string | number;
}

/**
 * Chat input component with centered design and rounded corners
 */
export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      className,
      placeholder = "Ask anything",
      suggestions,
      showSuggestions = true,
      floatId,
      ...props
    },
    ref,
  ) => {
    const {
      value,
      setValue,
      submit,
      isPending,
      error,
      images,
      addImages,
      removeImage,
    } = useTamboThreadInput();
    const { thread, cancel } = useTamboThread();
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [imageError, setImageError] = React.useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { elicitation, resolveElicitation } = useTamboElicitationContext();

    const handleSubmit = React.useCallback(
      async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!value.trim() && images.length === 0) return;

        try {
          setSubmitError(null);
          await submit({ streamResponse: true, resourceNames: {} });
        } catch (err) {
          setSubmitError(
            err instanceof Error ? err.message : "Failed to send message",
          );
        }
      },
      [value, images, submit],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      },
      [handleSubmit],
    );

    const handleFileClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const totalImages = images.length + files.length;
      if (totalImages > MAX_IMAGES) {
        setImageError(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const fileArray = Array.from(files);
      addImages(fileArray);
      e.target.value = "";
    };

    const handleSuggestionClick = (message: string) => {
      setValue(message);
      textareaRef.current?.focus();
    };

    // Auto-resize textarea
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [value]);

    const contextValue: ChatInputContextValue = {
      value,
      setValue,
      handleSubmit,
      isPending,
      error,
      images,
      addImages,
      removeImage,
      submitError,
      setSubmitError,
      imageError,
      setImageError,
      elicitation,
      resolveElicitation,
      cancel,
    };

    const hasMessages = thread?.messages && thread.messages.length > 0;
    const displayError = submitError || imageError || error?.message;

    const defaultSuggestions = suggestions || [
      {
        title: "Active floats",
        message: "Show me all active Argo floats in the network",
      },
      {
        title: "Network statistics",
        message: "What's the current status of the Argo network?",
      },
      { title: "Find floats", message: "Find BGC floats in the Pacific Ocean" },
      {
        title: "Temperature data",
        message: "Show temperature profiles for recent float measurements",
      },
    ];

    return (
      <ChatInputContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "flex flex-col items-center w-full",
            !hasMessages && "justify-center min-h-[60vh]",
            className,
          )}
          {...props}
        >
          {/* Elicitation UI */}
          {elicitation && resolveElicitation && (
            <div className="w-full max-w-3xl mb-4 px-4">
              <ElicitationUI
                request={elicitation}
                onResponse={(response: TamboElicitationResponse) =>
                  resolveElicitation(response)
                }
              />
            </div>
          )}

          {/* Poseidon heading - only show when no messages */}
          {!hasMessages && (
            <div className="mb-4 text-center">
              <h1 className="text-4xl font-bold mb-2">Poseidon</h1>
              <p className="text-lg text-green-600 dark:text-green-500">The Argo Float Agent</p>
            </div>
          )}

          {/* Main input container */}
          <div className="w-full max-w-3xl px-4">
            <div
              className={cn(
                "relative flex flex-col w-full",
                "bg-muted/50 dark:bg-muted/30",
                "border border-border",
                "rounded-3xl",
                "shadow-sm",
                "transition-all duration-200",
                "focus-within:border-primary/50 focus-within:shadow-md",
              )}
            >
              {/* Staged images */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 pb-0">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={image.dataUrl}
                        alt="Staged"
                        className="h-16 w-16 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className={cn(
                          "absolute -top-1 -right-1",
                          "w-5 h-5 rounded-full",
                          "bg-foreground/80 text-background",
                          "flex items-center justify-center",
                          "opacity-0 group-hover:opacity-100",
                          "transition-opacity duration-150",
                        )}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isPending}
                rows={1}
                className={cn(
                  "w-full resize-none",
                  "bg-transparent",
                  "px-4 py-4",
                  "text-foreground text-base",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "min-h-[56px] max-h-[200px]",
                )}
              />

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  {/* File attachment button */}
                  <button
                    type="button"
                    onClick={handleFileClick}
                    disabled={isPending}
                    className={cn(
                      "p-2 rounded-full",
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted",
                      "transition-colors duration-150",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    title="Attach files"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Submit/Cancel button */}
                <button
                  type="button"
                  onClick={() => (isPending ? cancel() : handleSubmit())}
                  disabled={!isPending && !value.trim() && images.length === 0}
                  className={cn(
                    "p-2 rounded-full",
                    "transition-all duration-150",
                    isPending
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : value.trim() || images.length > 0
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed",
                  )}
                  title={isPending ? "Stop generating" : "Send message"}
                >
                  {isPending ? (
                    <Square className="w-5 h-5 fill-current" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error display */}
            {displayError && (
              <div className="mt-2 px-4 py-2 text-sm text-destructive bg-destructive/10 rounded-lg">
                {displayError}
              </div>
            )}
          </div>

          {/* Suggestion chips - only show when no messages */}
          {!hasMessages && showSuggestions && (
            <div className="w-full max-w-3xl px-4 mt-4">
              <div className="flex flex-wrap justify-center gap-2">
                {defaultSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion.message)}
                    className={cn(
                      "px-4 py-2 rounded-full",
                      "text-sm text-muted-foreground",
                      "border border-border",
                      "bg-background hover:bg-muted",
                      "transition-colors duration-150",
                    )}
                  >
                    {suggestion.title}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </ChatInputContext.Provider>
    );
  },
);
ChatInput.displayName = "ChatInput";

export { useChatInputContext };
