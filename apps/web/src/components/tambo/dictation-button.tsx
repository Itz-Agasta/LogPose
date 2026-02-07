import { Tooltip } from "@/components/tambo/message-suggestions";
import { useTamboThreadInput, useTamboVoice } from "@tambo-ai/react";
import { Loader2Icon, Mic, Square } from "lucide-react";
import React, { useEffect, useRef } from "react";

/**
 * Button for dictating speech into the message input.
 * ChatGPT-style icon button with subtle hover state.
 */
export default function DictationButton() {
  const {
    startRecording,
    stopRecording,
    isRecording,
    isTranscribing,
    transcript,
    transcriptionError,
  } = useTamboVoice();
  const { setValue } = useTamboThreadInput();
  const lastProcessedTranscriptRef = useRef<string>("");

  const handleStartRecording = () => {
    lastProcessedTranscriptRef.current = "";
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  useEffect(() => {
    if (transcript && transcript !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = transcript;
      setValue((prev) => prev + " " + transcript);
    }
  }, [transcript, setValue]);

  if (isTranscribing) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-1">
      {transcriptionError && (
        <span className="text-xs text-destructive">{transcriptionError}</span>
      )}
      {isRecording ? (
        <Tooltip content="Stop">
          <button
            type="button"
            onClick={handleStopRecording}
            aria-label="Stop dictation"
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-muted transition-colors text-destructive"
          >
            <Square className="h-3.5 w-3.5 fill-current animate-pulse" />
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Voice input">
          <button
            type="button"
            onClick={handleStartRecording}
            aria-label="Start dictation"
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}
