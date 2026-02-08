"use client";

import type { MapMouseEvent, GeoJSONSource } from "mapbox-gl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FullscreenControl,
  GeolocateControl,
  Layer,
  Map as MapboxMap,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";

// Import the CSS for mapbox-gl
import "mapbox-gl/dist/mapbox-gl.css";

import type { ArgoFloat, PopupData, TooltipData } from "@LogPose/schema/web/float";
import type { FloatLocationsResponse } from "@LogPose/schema/api/home-page";
import { ModeToggle } from "../mode-toggle";
import Starfield from "../ui/starfield";
import FloatPopup from "./float-popup";
import FloatTooltip from "./float-tooltip";
import MapControlPanel, { MAP_STYLES } from "./map-control-panel";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Cluster configuration
const CLUSTER_MAX_ZOOM = 14;
const CLUSTER_RADIUS = 50;

// Colors for different float types
const FLOAT_COLORS: Record<string, { bg: string; border: string; glow: string; fill: string }> = {
  biogeochemical: {
    bg: "bg-green-500",
    border: "border-green-700",
    glow: "bg-green-400",
    fill: "#22c55e",
  },
  core: {
    bg: "bg-yellow-500",
    border: "border-yellow-600",
    glow: "bg-yellow-400",
    fill: "#eab308",
  },
  deep: { bg: "bg-blue-500", border: "border-blue-700", glow: "bg-blue-400", fill: "#3b82f6" },
  default: { bg: "bg-gray-500", border: "border-gray-700", glow: "bg-gray-400", fill: "#6b7280" },
};

function getMarkerColors(platformType: string) {
  return FLOAT_COLORS[platformType] || FLOAT_COLORS.default;
}

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

// Custom marker component for Argo floats
function ArgoMarker({
  float,
  onClick,
  onHover,
  onHoverEnd,
  isSelected,
}: {
  float: ArgoFloat;
  onClick: (e: MouseEvent) => void;
  onHover: (e: MouseEvent) => void;
  onHoverEnd: () => void;
  isSelected: boolean;
}) {
  const colors = getMarkerColors(float.platformType);

  return (
    <button
      aria-label={`Argo float ${float.id} at ${float.latitude}, ${float.longitude}`}
      className={`cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 ${
        isSelected ? "scale-125" : "hover:scale-110"
      }`}
      onClick={(e) => onClick(e.nativeEvent)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const simulatedEvent = new MouseEvent("click", {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true,
            cancelable: true,
          });
          onClick(simulatedEvent);
        }
      }}
      onMouseEnter={(e) => onHover(e.nativeEvent)}
      onMouseLeave={onHoverEnd}
      type="button"
    >
      <div className={`relative ${isSelected ? "animate-pulse" : ""}`}>
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 rounded-full ${
            isSelected ? "bg-white" : colors.glow
          } animate-ping opacity-30`}
        />

        {/* Main marker */}
        <div
          className={`relative h-5 w-5 rounded-full border-2 ${
            isSelected ? "border-gray-300 bg-white" : `${colors.border} ${colors.bg}`
          } flex items-center justify-center shadow-lg`}
        >
          {/* Boat icon */}
          <BoatIcon fill={isSelected ? colors.fill : "white"} size={10} />
        </div>
      </div>
    </button>
  );
}

type InteractiveArgoMapProps = {
  floatLocations?: FloatLocationsResponse["data"];
  isLoading?: boolean;
};

export default function InteractiveArgoMap({
  floatLocations = [],
  isLoading: _isLoading = false,
}: InteractiveArgoMapProps) {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [selectedFloat, setSelectedFloat] = useState<ArgoFloat | null>(null);
  const [hoveredFloat, setHoveredFloat] = useState<ArgoFloat | null>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.satellite);
  const [isGlobe, setIsGlobe] = useState(false);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [cursor, setCursor] = useState<string>("grab");
  const [visibleFloatIds, setVisibleFloatIds] = useState<Set<string>>(new Set());

  // Map API response to ArgoFloat format
  const floats: ArgoFloat[] = useMemo(
    () =>
      floatLocations.map((loc) => ({
        id: String(loc.floatId),
        floatNumber: String(loc.floatId),
        longitude: loc.longitude,
        latitude: loc.latitude,
        date: loc.lastUpdate || new Date().toISOString(),
        cycle: loc.cycleNumber || 0,
        platformType: loc.floatType,
        pi: "",
        telecomCode: "",
        sensors: [],
      })),
    [floatLocations],
  );

  // Convert floats to GeoJSON FeatureCollection for clustering
  const geojsonData: GeoJSON.FeatureCollection<GeoJSON.Point> = useMemo(
    () => ({
      type: "FeatureCollection",
      features: floats.map((float) => ({
        type: "Feature",
        id: float.id,
        properties: {
          id: float.id,
          floatNumber: float.floatNumber,
          platformType: float.platformType,
          date: float.date,
          cycle: float.cycle,
        },
        geometry: {
          type: "Point",
          coordinates: [float.longitude, float.latitude],
        },
      })),
    }),
    [floats],
  );

  // Calculate the bounds to fit all floats (focused on Indian Ocean)
  const initialViewState = useMemo(() => {
    const DEFAULT_FLAT_MAP_ZOOM = 4.5;
    return {
      longitude: 75,
      latitude: 8,
      zoom: isGlobe ? 2 : DEFAULT_FLAT_MAP_ZOOM,
    };
  }, [isGlobe]);

  // Update visible unclustered points when map moves or data changes
  const updateVisibleFloats = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    try {
      const features = map.querySourceFeatures("floats", {
        filter: ["!", ["has", "point_count"]],
      });

      const ids = new Set<string>();
      features.forEach((f) => {
        if (f.properties?.id) {
          ids.add(f.properties.id);
        }
      });
      setVisibleFloatIds(ids);
    } catch {
      // Source not ready yet
    }
  }, []);

  // Get floats that are currently visible and unclustered
  const unclusteredFloats = useMemo(() => {
    return floats.filter((f) => visibleFloatIds.has(f.id));
  }, [floats, visibleFloatIds]);

  // Handle click on clusters - zoom in to expand
  const handleClusterClick = useCallback((event: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ["clusters"],
    });

    if (features.length === 0) return;

    const clusterId = features[0].properties?.cluster_id;
    if (clusterId === undefined) return;

    const source = map.getSource("floats") as GeoJSONSource;
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      const geometry = features[0].geometry;
      if (geometry.type !== "Point") return;

      map.easeTo({
        center: geometry.coordinates as [number, number],
        zoom: zoom ?? 10,
        duration: 500,
      });
    });
  }, []);

  // Handle hover on clusters
  const handleMouseMove = useCallback((event: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const clusterFeatures = map.queryRenderedFeatures(event.point, {
      layers: ["clusters"],
    });

    if (clusterFeatures.length > 0) {
      setCursor("pointer");
    } else {
      setCursor("grab");
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // Check if clicked on a cluster
      const clusterFeatures = map.queryRenderedFeatures(event.point, {
        layers: ["clusters"],
      });
      if (clusterFeatures.length > 0) {
        handleClusterClick(event);
        return;
      }

      // Clicked on empty space - close popups
      setSelectedFloat(null);
      setClickPosition(null);
      setIsControlPanelOpen(false);
    },
    [handleClusterClick],
  );

  const handleMarkerClick = (float: ArgoFloat, event: MouseEvent) => {
    event.stopPropagation();
    setSelectedFloat(float);
    setClickPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMarkerHover = (float: ArgoFloat, event: MouseEvent) => {
    setHoveredFloat(float);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMarkerHoverEnd = () => {
    setHoveredFloat(null);
    setHoverPosition(null);
  };

  const handleShowProfile = () => {
    if (selectedFloat) {
      router.push(`/float/${selectedFloat.floatNumber}` as string & {});
    }
  };

  const handleClosePopup = () => {
    setSelectedFloat(null);
    setClickPosition(null);
  };

  // Convert ArgoFloat to TooltipData
  const getTooltipData = (float: ArgoFloat): TooltipData => ({
    id: float.id,
    longitude: float.longitude,
    latitude: float.latitude,
    date: float.date,
    cycle: float.cycle,
  });

  // Convert ArgoFloat to PopupData
  const getPopupData = (float: ArgoFloat): PopupData => ({
    floatNumber: float.floatNumber,
    cycle: float.cycle,
    date: float.date,
    platformType: float.platformType,
    pi: float.pi,
    telecomCode: float.telecomCode,
    sensors: float.sensors,
  });

  return (
    <div className="relative h-full w-full">
      {/* Dark Mode Toggle - top right */}
      <div className="absolute top-4 right-14 z-10">
        <ModeToggle />
      </div>

      {/* Starfield background for globe view */}
      <Starfield isVisible={isGlobe} />

      <MapboxMap
        ref={mapRef}
        cursor={cursor}
        initialViewState={initialViewState}
        interactiveLayerIds={["clusters"]}
        key={isGlobe ? "globe" : "mercator"}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMoveEnd={updateVisibleFloats}
        onLoad={updateVisibleFloats}
        onSourceData={updateVisibleFloats}
        projection={{ name: isGlobe ? "globe" : "mercator" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Map Controls */}
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl position="top-right" />

        {/* GeoJSON Source with Clustering */}
        <Source
          id="floats"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={CLUSTER_MAX_ZOOM}
          clusterRadius={CLUSTER_RADIUS}
        >
          {/* Cluster circles layer */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-radius": [
                "step",
                ["get", "point_count"],
                15,
                10,
                20,
                50,
                25,
                100,
                30,
                500,
                40,
              ],
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6",
                10,
                "#3b82f6",
                50,
                "#8b5cf6",
                100,
                "#f59e0b",
                500,
                "#ef4444",
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.9,
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-size": 12,
              "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />
        </Source>

        {/* Render unclustered floats as React Markers with boat icons */}
        {unclusteredFloats.map((float) => (
          <Marker
            anchor="center"
            key={float.id}
            latitude={float.latitude}
            longitude={float.longitude}
          >
            <ArgoMarker
              float={float}
              isSelected={selectedFloat?.id === float.id}
              onClick={(e) => handleMarkerClick(float, e)}
              onHover={(e) => handleMarkerHover(float, e)}
              onHoverEnd={handleMarkerHoverEnd}
            />
          </Marker>
        ))}
      </MapboxMap>

      {/* Dusky overlay for satellite view */}
      {mapStyle === MAP_STYLES.satellite && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(45deg, rgba(30, 41, 59, 0.15) 0%, rgba(51, 65, 85, 0.25) 50%, rgba(30, 41, 59, 0.15) 100%)",
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Control Panel */}
      <MapControlPanel
        isGlobe={isGlobe}
        isOpen={isControlPanelOpen}
        mapStyle={mapStyle}
        setIsGlobe={setIsGlobe}
        setIsOpen={setIsControlPanelOpen}
        setMapStyle={setMapStyle}
      />

      {/* Hover Tooltip */}
      <FloatTooltip
        data={hoveredFloat ? getTooltipData(hoveredFloat) : null}
        position={hoverPosition}
        visible={!!hoveredFloat && !!hoverPosition}
      />

      {/* Click Popup */}
      <FloatPopup
        data={selectedFloat ? getPopupData(selectedFloat) : null}
        onClose={handleClosePopup}
        onShowProfile={handleShowProfile}
        position={clickPosition}
        visible={!!selectedFloat && !!clickPosition}
      />
    </div>
  );
}
