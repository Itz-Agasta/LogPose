"use client";

import { useEffect } from "react";
import { useFloatDisplay } from "@/components/profile/float-display-context";
import { type GraphProps, graphSchema } from "@/components/tambo/graph";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

export const renderFloatGraphSchema = graphSchema;

export function RenderFloatGraph(props: GraphProps) {
  const { setAiGraph, setActiveTab } = useFloatDisplay();

  useEffect(() => {
    // When this component is rendered by the AI, we update the main context
    // to show this graph in the "Agent Analysis" tab
    if (props.data) {
      // Extract floatId to prevent it from being passed to the DOM in the Graph component
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { floatId, ...cleanProps } = props as GraphProps & {
        floatId?: unknown;
      };
      setAiGraph(cleanProps);
      setActiveTab("agent-analysis");
    }
  }, [props, setAiGraph, setActiveTab]);

  // We render a small status card in the chat to indicate the action was taken
  return (
    <Card className="w-full max-w-sm bg-muted/50 border-dashed">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Check className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Graph rendered on dashboard</p>
          <p className="text-xs text-muted-foreground">
            Check the "Agent Analysis" tab
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
