"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconMapPin } from "@tabler/icons-react";
import { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { Map as MapboxMap, Marker, NavigationControl, ScaleControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Map style - satellite with labels for better ocean visualization
const MAP_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

type FloatLocation = {
  floatId?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: "ACTIVE" | "INACTIVE" | "UNKNOWN" | "DEAD" | string | null;
  floatType?: "core" | "oxygen" | "biogeochemical" | "deep" | "unknown" | string | null;
};

type FloatLocationMapProps = {
  locations?: FloatLocation[] | null;
  centerLat?: number | null;
  centerLng?: number | null;
  zoom?: number | null;
  title?: string | null;
  regionName?: string | null;
};

const getStatusColor = (status?: string | null): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500";
    case "INACTIVE":
      return "bg-yellow-500";
    case "DEAD":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusFillColor = (status?: string | null): string => {
  switch (status) {
    case "ACTIVE":
      return "#22c55e";
    case "INACTIVE":
      return "#eab308";
    case "DEAD":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getFloatTypeColor = (floatType?: string | null): string => {
  switch (floatType) {
    case "biogeochemical":
      return "#22c55e";
    case "core":
      return "#eab308";
    case "deep":
      return "#3b82f6";
    case "oxygen":
      return "#8b5cf6";
    default:
      return "#6b7280";
  }
};

const getStatusBadgeColor = (status?: string | null): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "INACTIVE":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "DEAD":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// Boat/Ship SVG icon component
function BoatIcon({ fill, size = 16 }: { fill: string; size?: number }) {
  return (
    <svg
      fill={fill}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z" />
    </svg>
  );
}

// Float marker component
function FloatMarker({
  location,
  onClick,
}: {
  location: FloatLocation & { x?: number; y?: number };
  onClick?: () => void;
}) {
  const color = getFloatTypeColor(location.floatType);
  const statusColor = getStatusFillColor(location.status);

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 hover:scale-110"
      aria-label={`Float ${location.floatId}`}
    >
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: color }}
        />

        {/* Main marker */}
        <div
          className="relative h-5 w-5 rounded-full border-2 flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: color,
            borderColor: statusColor,
          }}
        >
          <BoatIcon fill="white" size={10} />
        </div>

        {/* Status indicator dot */}
        <div
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-white"
          style={{ backgroundColor: statusColor }}
        />
      </div>
    </button>
  );
}

export default function FloatLocationMap({
  locations,
  centerLat,
  centerLng,
  zoom,
  title,
  regionName,
}: FloatLocationMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter valid locations
  const validLocations = useMemo(() => {
    if (!locations) return [];
    return locations.filter(
      (loc) =>
        loc.latitude !== undefined &&
        loc.latitude !== null &&
        loc.longitude !== undefined &&
        loc.longitude !== null,
    );
  }, [locations]);

  // Calculate bounds and center
  const { center, calculatedZoom } = useMemo(() => {
    // If center is explicitly provided, use it
    if (
      centerLat !== undefined &&
      centerLat !== null &&
      centerLng !== undefined &&
      centerLng !== null
    ) {
      return {
        center: { lat: centerLat, lng: centerLng },
        calculatedZoom: zoom ?? 6,
      };
    }

    // If no locations, default to world view
    if (validLocations.length === 0) {
      return {
        center: { lat: 0, lng: 0 },
        calculatedZoom: 2,
      };
    }

    // Calculate center from locations
    const lats = validLocations.map((loc) => loc.latitude!);
    const lngs = validLocations.map((loc) => loc.longitude!);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const avgLat = (minLat + maxLat) / 2;
    const avgLng = (minLng + maxLng) / 2;

    // Calculate appropriate zoom based on spread
    const latSpread = maxLat - minLat;
    const lngSpread = maxLng - minLng;
    const maxSpread = Math.max(latSpread, lngSpread);

    let autoZoom = 10;
    if (maxSpread > 60) autoZoom = 2;
    else if (maxSpread > 30) autoZoom = 3;
    else if (maxSpread > 15) autoZoom = 4;
    else if (maxSpread > 8) autoZoom = 5;
    else if (maxSpread > 4) autoZoom = 6;
    else if (maxSpread > 2) autoZoom = 7;
    else if (maxSpread > 1) autoZoom = 8;
    else if (maxSpread > 0.5) autoZoom = 9;

    return {
      center: { lat: avgLat, lng: avgLng },
      calculatedZoom: zoom ?? autoZoom,
    };
  }, [validLocations, centerLat, centerLng, zoom]);

  // Fit bounds when locations change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || validLocations.length === 0) return;

    // If explicit center provided, fly to it
    if (
      centerLat !== undefined &&
      centerLat !== null &&
      centerLng !== undefined &&
      centerLng !== null
    ) {
      mapRef.current.flyTo({
        center: [centerLng, centerLat],
        zoom: zoom ?? 6,
        duration: 1000,
      });
      return;
    }

    // Otherwise fit to bounds of all locations
    if (validLocations.length === 1) {
      mapRef.current.flyTo({
        center: [validLocations[0].longitude!, validLocations[0].latitude!],
        zoom: 8,
        duration: 1000,
      });
    } else if (validLocations.length > 1) {
      const lats = validLocations.map((loc) => loc.latitude!);
      const lngs = validLocations.map((loc) => loc.longitude!);

      mapRef.current.fitBounds(
        [
          [Math.min(...lngs) - 0.5, Math.min(...lats) - 0.5],
          [Math.max(...lngs) + 0.5, Math.max(...lats) + 0.5],
        ],
        {
          padding: 40,
          duration: 1000,
        },
      );
    }
  }, [validLocations, centerLat, centerLng, zoom, mapLoaded]);

  // Count by status
  const statusCounts = useMemo(() => {
    if (!validLocations.length) return {};

    return validLocations.reduce(
      (acc, loc) => {
        let status = loc.status;
        if (!status || !["ACTIVE", "INACTIVE", "DEAD", "UNKNOWN"].includes(status)) {
          status = "UNKNOWN";
        }
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [validLocations]);

  // Count by type
  const typeCounts = useMemo(() => {
    if (!validLocations.length) return {};

    return validLocations.reduce(
      (acc, loc) => {
        const type = loc.floatType || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [validLocations]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  return (
    <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title || regionName || "Float Locations"}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {validLocations.length} float
            {validLocations.length !== 1 ? "s" : ""}
          </span>
        </div>
        {regionName && !title && (
          <p className="text-sm text-muted-foreground mt-1">Showing floats in {regionName}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mapbox Map */}
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border/50">
          <MapboxMap
            ref={mapRef}
            initialViewState={{
              longitude: center.lng,
              latitude: center.lat,
              zoom: calculatedZoom,
            }}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={MAP_STYLE}
            style={{ width: "100%", height: "100%" }}
            onLoad={handleMapLoad}
            attributionControl={false}
          >
            <NavigationControl position="top-right" showCompass={false} />
            <ScaleControl position="bottom-right" />

            {/* Float markers */}
            {validLocations.map((loc, index) => (
              <Marker
                key={loc.floatId ?? index}
                latitude={loc.latitude!}
                longitude={loc.longitude!}
                anchor="center"
              >
                <FloatMarker location={loc} />
              </Marker>
            ))}
          </MapboxMap>

          {/* Coordinates display */}
          <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
            Center: {center.lat.toFixed(2)}°, {center.lng.toFixed(2)}°
          </div>
        </div>

        {/* Legend - Float Types */}
        {Object.keys(typeCounts).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Float Types</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: getFloatTypeColor(type),
                    color: getFloatTypeColor(type),
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: getFloatTypeColor(type) }}
                  />
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Legend - Status counts */}
        {Object.keys(statusCounts).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Badge key={status} className={`${getStatusBadgeColor(status)} border`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor(status)}`} />
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {validLocations.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <IconMapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No float locations to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
