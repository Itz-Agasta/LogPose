"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IconAnchor,
  IconDroplet,
  IconMapPin,
  IconRefresh,
  IconTemperature,
  IconUser,
} from "@tabler/icons-react";

type FloatDataCardProps = {
  floatId?: number | null;
  wmoNumber?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "UNKNOWN" | "DEAD" | string | null;
  floatType?:
    | "core"
    | "oxygen"
    | "biogeochemical"
    | "deep"
    | "unknown"
    | string
    | null;
  latitude?: number | null;
  longitude?: number | null;
  cycleNumber?: number | null;
  lastUpdate?: string | null;
  temperature?: number | null;
  salinity?: number | null;
  depth?: number | null;
  piName?: string | null;
  institution?: string | null;
};

const getStatusColor = (status?: string | null): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "INACTIVE":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "DEAD":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"; // UNKNOWN or any invalid value
  }
};

const getFloatTypeLabel = (floatType?: string | null): string => {
  switch (floatType) {
    case "core":
      return "Core Argo";
    case "oxygen":
      return "Oxygen";
    case "biogeochemical":
      return "BGC Argo";
    case "deep":
      return "Deep Argo";
    default:
      return floatType ?? "Unknown";
  }
};

export default function FloatDataCard({
  floatId,
  wmoNumber,
  status,
  floatType,
  latitude,
  longitude,
  cycleNumber,
  lastUpdate,
  temperature,
  salinity,
  depth,
  piName,
  institution,
}: FloatDataCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCoordinate = (
    value: number | undefined | null,
    type: "lat" | "lng",
  ) => {
    if (value === undefined || value === null) return "—";
    const direction =
      type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAnchor className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Float {floatId ?? "—"}
              {wmoNumber && (
                <span className="text-muted-foreground text-sm ml-2">
                  ({wmoNumber})
                </span>
              )}
            </CardTitle>
          </div>
          {status && (
            <Badge className={`${getStatusColor(status)} border`}>
              {status}
            </Badge>
          )}
        </div>
        {floatType && (
          <p className="text-sm text-muted-foreground">
            {getFloatTypeLabel(floatType)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconMapPin className="h-4 w-4 text-muted-foreground" />
            <span>Location</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-6">
            <div className="text-sm">
              <span className="text-muted-foreground">Lat: </span>
              <span>{formatCoordinate(latitude, "lat")}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Lng: </span>
              <span>{formatCoordinate(longitude, "lng")}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Measurements */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Latest Measurements</div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <IconTemperature className="h-4 w-4 text-orange-400 mb-1" />
              <span className="text-xs text-muted-foreground">Temp</span>
              <span className="text-sm font-medium">
                {temperature !== undefined && temperature !== null
                  ? `${temperature.toFixed(1)}°C`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <IconDroplet className="h-4 w-4 text-blue-400 mb-1" />
              <span className="text-xs text-muted-foreground">Salinity</span>
              <span className="text-sm font-medium">
                {salinity !== undefined && salinity !== null
                  ? `${salinity.toFixed(2)} PSU`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/50">
              <IconAnchor className="h-4 w-4 text-cyan-400 mb-1" />
              <span className="text-xs text-muted-foreground">Depth</span>
              <span className="text-sm font-medium">
                {depth !== undefined && depth !== null
                  ? `${depth.toFixed(0)} m`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          {cycleNumber !== undefined && cycleNumber !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <IconRefresh className="h-4 w-4" />
                Cycle
              </span>
              <span>{cycleNumber}</span>
            </div>
          )}
          {lastUpdate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Update</span>
              <span>{formatDate(lastUpdate)}</span>
            </div>
          )}
          {piName && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                PI
              </span>
              <span className="truncate max-w-[200px]">{piName}</span>
            </div>
          )}
          {institution && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Institution</span>
              <span className="truncate max-w-[200px]">{institution}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
