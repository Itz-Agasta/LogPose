"use client";

import { Activity, Calendar, Compass, Layers, MapPin } from "lucide-react";
import type {
  CycleProfile,
  FloatProfileMetadata,
} from "@LogPose/schema/api/profile";
import { MiniMap } from "@/components/profile/MiniMap";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface FloatSidebarProps {
  metadata: FloatProfileMetadata;
  currentCycle: CycleProfile;
  availableCycles: number[];
  onCycleChange: (cycle: number) => void;
}

export function ProfileSidebar({
  metadata,
  currentCycle,
  availableCycles,
  onCycleChange,
}: FloatSidebarProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-background px-6 py-8 overflow-y-auto h-full">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Float {metadata.floatId}
            </h1>
            <Badge
              variant="secondary"
              className={
                metadata.status === "ACTIVE"
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800 text-xs px-2 py-1"
                  : metadata.status === "INACTIVE"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800 text-xs px-2 py-1"
                    : metadata.status === "DEAD"
                      ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800 text-xs px-2 py-1"
                      : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800 text-xs px-2 py-1"
              }
            >
              {metadata.status}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Cycle Selector */}
        {availableCycles.length > 1 && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Select Cycle
            </label>
            <Select
              value={String(currentCycle.cycleNumber)}
              onValueChange={(val) => onCycleChange(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                {availableCycles.map((cycle) => (
                  <SelectItem key={cycle} value={String(cycle)}>
                    Cycle {cycle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Float Details */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              Float Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {metadata.operatingInstitution && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Institution
                </span>
                <p className="text-base text-foreground leading-relaxed">
                  {metadata.operatingInstitution}
                </p>
              </div>
            )}

            {metadata.piName && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  PI
                </span>
                <p className="text-base text-foreground">{metadata.piName}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Float Type
                </span>
                <Badge
                  variant="outline"
                  className="w-fit px-3 py-1 text-sm capitalize"
                >
                  {metadata.floatType}
                </Badge>
              </div>
              {metadata.dataCentre && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Data Centre
                  </span>
                  <p className="text-base font-medium text-foreground">
                    {metadata.dataCentre}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {metadata.platformType && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Platform
                  </span>
                  <p className="text-base text-foreground">
                    {metadata.platformType}
                  </p>
                </div>
              )}
              {metadata.platformMaker && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Maker
                  </span>
                  <p className="text-base text-foreground">
                    {metadata.platformMaker}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cycle Information */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3">
              <Compass className="h-5 w-5 text-primary" />
              Cycle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Cycle Number
              </span>
              <p className="text-2xl font-bold text-primary">
                {currentCycle.cycleNumber}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Time
              </span>
              <p className="text-base font-mono text-foreground bg-muted/50 px-4 py-3 rounded-md">
                {formatDate(currentCycle.timestamp)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Data Levels
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {currentCycle.measurements.length}
                </p>
              </div>
              {currentCycle.dataMode && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Data Mode
                  </span>
                  <Badge variant="outline" className="w-fit px-3 py-1 text-sm">
                    {currentCycle.dataMode === "D"
                      ? "Delayed"
                      : currentCycle.dataMode === "A"
                        ? "Adjusted"
                        : "Real-time"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Position */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-base font-mono text-center text-foreground">
                  {Math.abs(metadata.latitude).toFixed(4)}°
                  {metadata.latitude >= 0 ? "N" : "S"}{" "}
                  {Math.abs(metadata.longitude).toFixed(4)}°
                  {metadata.longitude >= 0 ? "E" : "W"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Location Preview
              </span>
              <MiniMap
                latitude={metadata.latitude}
                longitude={metadata.longitude}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              Data Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pressure range
                </span>
                <span className="text-sm font-medium text-foreground">
                  {currentCycle.measurements.length > 0
                    ? `${Math.min(...currentCycle.measurements.map((m) => m.pressure)).toFixed(0)} — ${Math.max(...currentCycle.measurements.map((m) => m.pressure)).toFixed(0)} dbar`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Temp range
                </span>
                <span className="text-sm font-medium text-foreground">
                  {currentCycle.measurements.length > 0
                    ? `${Math.min(...currentCycle.measurements.map((m) => m.temperature)).toFixed(1)} — ${Math.max(...currentCycle.measurements.map((m) => m.temperature)).toFixed(1)} °C`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Salinity range
                </span>
                <span className="text-sm font-medium text-foreground">
                  {currentCycle.measurements.length > 0
                    ? `${Math.min(...currentCycle.measurements.map((m) => m.salinity)).toFixed(2)} — ${Math.max(...currentCycle.measurements.map((m) => m.salinity)).toFixed(2)} PSU`
                    : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
