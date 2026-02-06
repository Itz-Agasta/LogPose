"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FullscreenControl,
  GeolocateControl,
  Map as MapboxMap,
  Marker,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";

// Import the CSS for mapbox-gl
import "mapbox-gl/dist/mapbox-gl.css";

import type { ArgoFloat, PopupData, TooltipData } from "@LogPose/schema/web/float";
import type { FloatLocationsResponse } from "@LogPose/schema/api/home-page";
import Starfield from "../ui/starfield";
import FloatPopup from "./float-popup";
import FloatTooltip from "./float-tooltip";
import MapControlPanel, { MAP_STYLES } from "./map-control-panel";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type InteractiveArgoMapProps = {
  floatLocations?: FloatLocationsResponse["data"];
  isLoading?: boolean;
};
// Get marker colors based on float type
function getMarkerColors(platformType: string) {
  switch (platformType) {
    case "biogeochemical":
      return { bg: "bg-green-500", border: "border-green-700", glow: "bg-green-400", fill: "#22c55e" };
    case "core":
      return { bg: "bg-yellow-500", border: "border-yellow-600", glow: "bg-yellow-400", fill: "#eab308" };
    case "deep":
      return { bg: "bg-blue-500", border: "border-blue-700", glow: "bg-blue-400", fill: "#3b82f6" };
    default:
      return { bg: "bg-gray-500", border: "border-gray-700", glow: "bg-gray-400", fill: "#6b7280" };
  }
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
      className={`cursor-pointer border-none bg-transparent p-0 transition-transform duration-200 ${isSelected ? "scale-125" : "hover:scale-110"
        }`}
      onClick={(e) => onClick(e.nativeEvent)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          // For keyboard events, just call the click handler with a simulated mouse event
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
          className={`absolute inset-0 rounded-full ${isSelected ? "bg-white" : colors.glow
            } animate-ping opacity-30`}
        />

        {/* Main marker */}
        <div
          className={`relative h-5 w-5 rounded-full border-2 ${isSelected ? "border-gray-300 bg-white" : `${colors.border} ${colors.bg}`
            } flex items-center justify-center shadow-lg`}
        >
          {/* Boat icon */}
          <BoatIcon fill={isSelected ? colors.fill : "white"} size={10} />
        </div>

        {/* Simple hover label */}
        <div className="-top-8 -translate-x-1/2 pointer-events-none absolute left-1/2 transform whitespace-nowrap rounded-lg border border-slate-600/50 bg-slate-800 bg-opacity-95 px-3 py-1.5 text-white text-xs opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:opacity-100">
          Float {float.floatNumber}
        </div>
      </div>
    </button>
  );
}

export default function InteractiveArgoMap({ floatLocations = [], isLoading: _isLoading = false }: InteractiveArgoMapProps) {
  const _router = useRouter();
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

  // Map API response to ArgoFloat format
  const floats: ArgoFloat[] = useMemo(() =>
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
    })), [floatLocations]);

  // FIXME: Have to change this later
  // Calculate the bounds to fit all floats (focused on Indian Ocean)
  const bounds = useMemo(() => {
    if (floats.length === 0) {
      return null;
    }

    // Center on Indian Ocean with appropriate zoom
    const DEFAULT_FLAT_MAP_ZOOM = 4.5;
    return {
      longitude: 75, // Central Indian Ocean longitude
      latitude: 8, // Slightly north for better view of India's coast
      zoom: isGlobe ? 2 : DEFAULT_FLAT_MAP_ZOOM,
    };
  }, [floats, isGlobe]);

  const handleMarkerClick = (float: ArgoFloat, event: MouseEvent) => {
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
      // Navigate to the float profile page
      //router.push(`/float/${selectedFloat.floatNumber}`);
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
      {/* Starfield background for globe view */}
      <Starfield isVisible={isGlobe} />

      <MapboxMap
        initialViewState={
          bounds || {
            longitude: 75,
            latitude: 8,
            zoom: 4.5,
          }
        }
        interactiveLayerIds={[]}
        key={isGlobe ? "globe" : "mercator"}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        onClick={() => {
          // Close popup when clicking on map
          setSelectedFloat(null);
          setClickPosition(null);
          // Close control panel when clicking on map
          setIsControlPanelOpen(false);
        }}
        projection={{ name: isGlobe ? "globe" : "mercator" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Map Controls */}
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />
        <ScaleControl position="top-right" />

        {/* Argo Float Markers */}
        {floats.map((float) => (
          <Marker
            anchor="center"
            key={float.id}
            latitude={float.latitude}
            longitude={float.longitude}
            onClick={(e: any) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(float, e.originalEvent);
            }}
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
