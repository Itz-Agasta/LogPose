"use client";

import { AlertCircle, ArrowLeft, Loader2, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CycleProfile, FloatProfileMetadata } from "@LogPose/schema/api/profile";
import { Dashboard } from "@/components/profile/Dashboard";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { fetchCycleProfile, fetchFloatProfile } from "@/lib/utils";

interface FloatProfilePageProps {
  floatId: string;
}

export function FloatProfilePage({ floatId }: FloatProfilePageProps) {
  const [metadata, setMetadata] = useState<FloatProfileMetadata | null>(null);
  const [currentCycle, setCurrentCycle] = useState<CycleProfile | null>(null);
  const [availableCycles, setAvailableCycles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const floatIdNum = Number.parseInt(floatId, 10);

        if (Number.isNaN(floatIdNum)) {
          setError("Invalid float ID");
          return;
        }

        const response = await fetchFloatProfile(floatIdNum);

        if (!response.success) {
          setError("Failed to load profile data");
          return;
        }

        setMetadata(response.data.metadata);
        setCurrentCycle(response.data.latestCycle);
        setAvailableCycles(response.data.availableCycles);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [floatId]);

  const handleCycleChange = useCallback(
    async (cycleNumber: number) => {
      try {
        const floatIdNum = Number.parseInt(floatId, 10);
        const response = await fetchCycleProfile(floatIdNum, cycleNumber);

        if (response.success) {
          setCurrentCycle(response.data);
        }
      } catch (err) {
        console.error("Failed to load cycle:", err);
      }
    },
    [floatId],
  );

  const hasOxygen = currentCycle?.measurements.some((m) => m.oxygen != null) ?? false;
  const hasChlorophyll = currentCycle?.measurements.some((m) => m.chlorophyll != null) ?? false;
  const hasNitrate = currentCycle?.measurements.some((m) => m.nitrate != null) ?? false;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading float profile...</p>
        </div>
      </div>
    );
  }

  if (error || !metadata || !currentCycle) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "No data available for this float."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <FloatProfileContent
        metadata={metadata}
        currentCycle={currentCycle}
        availableCycles={availableCycles}
        onCycleChange={handleCycleChange}
        hasOxygen={hasOxygen}
        hasChlorophyll={hasChlorophyll}
        hasNitrate={hasNitrate}
      />
    </SidebarProvider>
  );
}

function FloatProfileContent({
  metadata,
  currentCycle,
  availableCycles,
  onCycleChange,
  hasOxygen,
  hasChlorophyll,
  hasNitrate,
}: {
  metadata: FloatProfileMetadata;
  currentCycle: CycleProfile;
  availableCycles: number[];
  onCycleChange: (cycle: number) => void;
  hasOxygen: boolean;
  hasChlorophyll: boolean;
  hasNitrate: boolean;
}) {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Left Sidebar */}
      <Sidebar variant="sidebar" collapsible="none">
        <SidebarContent>
          <ProfileSidebar
            metadata={metadata}
            currentCycle={currentCycle}
            availableCycles={availableCycles}
            onCycleChange={onCycleChange}
          />
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isAiSidebarOpen ? "mr-96" : ""}`}
      >
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon-sm">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Home</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Float {metadata.floatId} — Cycle {currentCycle.cycleNumber}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {metadata.operatingInstitution || metadata.dataCentre || "Argo Float"} ·{" "}
                  {currentCycle.measurements.length} depth levels
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
              >
                <MessageSquare className="h-4 w-4" />
                {isAiSidebarOpen ? "Hide" : "Ask"} AI Assistant
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Dashboard
            metadata={metadata}
            currentCycle={currentCycle}
            hasOxygen={hasOxygen}
            hasChlorophyll={hasChlorophyll}
            hasNitrate={hasNitrate}
          />
        </main>
      </div>

      {/* AI Assistant Sidebar */}
      {isAiSidebarOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">AI Assistant</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAiSidebarOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <p className="text-sm text-muted-foreground">
              Use the chat page to ask questions about this float&apos;s data. Navigate to{" "}
              <a href="/chat" className="text-primary underline">
                /chat
              </a>{" "}
              for the full AI assistant experience.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
