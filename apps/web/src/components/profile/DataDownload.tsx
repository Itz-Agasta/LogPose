"use client";

import { saveAs } from "file-saver";
import { Database, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FloatProfileMetadata, ProfileMeasurement } from "@LogPose/schema/api/profile";

interface DataDownloadProps {
  data: ProfileMeasurement[];
  metadata: FloatProfileMetadata;
}

export function DataDownload({ data, metadata }: DataDownloadProps) {
  const downloadCSV = () => {
    const headers = [
      "pressure_dbar",
      "temperature_celsius",
      "salinity_psu",
      "oxygen_umol_kg",
      "chlorophyll_mg_m3",
      "nitrate_umol_kg",
    ].join(",");

    const csvContent = [
      `# ARGO Float Data - Float ${metadata.floatId}`,
      `# WMO Number: ${metadata.wmoNumber}`,
      `# Cycle: ${metadata.cycleNumber}`,
      `# Last Update: ${metadata.lastUpdate}`,
      `# Position: ${metadata.latitude}°N, ${metadata.longitude}°E`,
      `# Institution: ${metadata.operatingInstitution}`,
      `# Data Mode: ${metadata.dataMode}`,
      "#",
      headers,
      ...data.map((d) =>
        [
          d.pressure,
          d.temperature,
          d.salinity,
          d.oxygen ?? "",
          d.chlorophyll ?? "",
          d.nitrate ?? "",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `argo_float_${metadata.floatId}_cycle_${metadata.cycleNumber}.csv`);
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify(
      {
        metadata: {
          floatId: metadata.floatId,
          wmoNumber: metadata.wmoNumber,
          cycleNumber: metadata.cycleNumber,
          lastUpdate: metadata.lastUpdate,
          position: {
            latitude: metadata.latitude,
            longitude: metadata.longitude,
          },
          institution: metadata.operatingInstitution,
          dataMode: metadata.dataMode,
          status: metadata.status,
          totalCycles: metadata.totalCycles,
        },
        measurements: data,
      },
      null,
      2,
    );

    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    saveAs(blob, `argo_float_${metadata.floatId}_cycle_${metadata.cycleNumber}.json`);
  };

  // Check which optional params are available
  const hasOxygen = data.some((d) => d.oxygen != null);
  const hasChlorophyll = data.some((d) => d.chlorophyll != null);
  const hasNitrate = data.some((d) => d.nitrate != null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5" />
          Download Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data summary */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Float ID</span>
            <span className="font-medium">{metadata.floatId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Update</span>
            <span className="font-medium">
              {metadata.lastUpdate
                ? new Date(metadata.lastUpdate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cycle</span>
            <span className="font-medium">{metadata.cycleNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Levels</span>
            <span className="font-medium">{data.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Parameters</span>
            <span className="font-medium">
              T, S, P{hasOxygen ? ", O₂" : ""}
              {hasChlorophyll ? ", Chl" : ""}
              {hasNitrate ? ", NO₃" : ""}
            </span>
          </div>
        </div>

        {/* Download buttons */
        /*// TODO: Make these Buttons functional */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={downloadJSON} className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
