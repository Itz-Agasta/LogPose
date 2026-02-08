"use client";

import type { GraphProps } from "@/components/tambo/graph";
import { createContext, useContext, useState, type ReactNode } from "react";

import type { CycleProfile, FloatProfileMetadata } from "@LogPose/schema/api/profile";

interface FloatDisplayContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  aiGraphConfig: GraphProps | null;
  setAiGraph: (config: GraphProps | null) => void;
  metadata: FloatProfileMetadata | null;
  currentCycle: CycleProfile | null;
}

export const FloatDisplayContext = createContext<FloatDisplayContextType | undefined>(undefined);

export function FloatDisplayProvider({
  children,
  metadata = null,
  currentCycle = null,
}: {
  children: ReactNode;
  metadata?: FloatProfileMetadata | null;
  currentCycle?: CycleProfile | null;
}) {
  const [activeTab, setActiveTab] = useState("profiles");
  const [aiGraphConfig, setAiGraph] = useState<GraphProps | null>(null);

  return (
    <FloatDisplayContext.Provider
      value={{
        activeTab,
        setActiveTab,
        aiGraphConfig,
        setAiGraph,
        metadata,
        currentCycle,
      }}
    >
      {children}
    </FloatDisplayContext.Provider>
  );
}

export function useFloatDisplay() {
  const context = useContext(FloatDisplayContext);
  if (context === undefined) {
    throw new Error("useFloatDisplay must be used within a FloatDisplayProvider");
  }
  return context;
}
