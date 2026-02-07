"use client";

import * as React from "react";
import { useTamboThreadInput } from "@tambo-ai/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SendHorizontal, Loader2 } from "lucide-react";

export interface TamboMessageThreadInputProps extends Omit<
  React.ComponentProps<"textarea">,
  "value" | "onChange"
> {
  /** Custom placeholder text */
  placeholder?: string;
  /** Whether to show the submit button inline */
  showSubmitButton?: boolean;
  /** Custom submit button content */
  submitButtonContent?: React.ReactNode;
  /** Additional class name for the container */
  containerClassName?: string;
  /** Whether to enable streaming responses */
  streamResponse?: boolean;
  /** Callback fired after successful message submission */
  onSubmitSuccess?: () => void;
  /** Callback fired when submission fails */
  onSubmitError?: (error: Error) => void;
}

/**
 * A wrapper around shadcn Textarea that integrates with Tambo's thread input functionality.
 * Provides a simple, styled text input for sending messages to the Tambo AI thread.
 *
 * @example
 * ```tsx
 * <TamboMessageThreadInput
 *   placeholder="Ask me anything..."
 *   showSubmitButton
 *   streamResponse
 * />
 * ```
 */
const TamboMessageThreadInput = React.forwardRef<
  HTMLTextAreaElement,
  TamboMessageThreadInputProps
>(
  (
    {
      className,
      containerClassName,
      placeholder = "Type your message...",
      showSubmitButton = true,
      submitButtonContent,
      streamResponse = true,
      onSubmitSuccess,
      onSubmitError,
      disabled,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const { value, setValue, submit, isPending, error } = useTamboThreadInput();
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!, []);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
      },
      [setValue],
    );

    const handleSubmit = React.useCallback(async () => {
      if (!value.trim() || isPending) return;

      try {
        await submit({
          streamResponse,
        });
        onSubmitSuccess?.();
      } catch (err) {
        onSubmitError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }, [
      value,
      isPending,
      submit,
      streamResponse,
      onSubmitSuccess,
      onSubmitError,
    ]);

    const handleKeyDown = React.useCallback(
      async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Call any external onKeyDown handler first
        onKeyDown?.(e);

        // Submit on Enter (without Shift)
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          await handleSubmit();
        }
      },
      [handleSubmit, onKeyDown],
    );

    const isDisabled = disabled || isPending;
    const hasContent = value.trim().length > 0;

    return (
      <div className={cn("relative w-full", containerClassName)}>
        <div
          className={cn(
            "flex items-end gap-2 rounded-lg p-2",
            "transition-all duration-200",
            isDisabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn(
              "flex-1 resize-none p-2 text-sm",
              "focus-visible:outline-none",
              "min-h-[40px] max-h-[200px]",
              "placeholder:text-muted-foreground",
              className,
            )}
            rows={1}
            aria-label="Message input"
            data-slot="tambo-message-thread-input"
            {...props}
          />

          {showSubmitButton && (
            <Button
              type="button"
              size="icon"
              variant={hasContent ? "default" : "ghost"}
              onClick={handleSubmit}
              disabled={isDisabled || !hasContent}
              className={cn(
                "h-8 w-8 shrink-0 rounded-md transition-all duration-200",
                hasContent
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={isPending ? "Sending message..." : "Send message"}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                (submitButtonContent ?? <SendHorizontal className="h-4 w-4" />)
              )}
            </Button>
          )}
        </div>

        {error && (
          <div
            className="mt-2 text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error.message}
          </div>
        )}
      </div>
    );
  },
);

TamboMessageThreadInput.displayName = "TamboMessageThreadInput";

export { TamboMessageThreadInput };
