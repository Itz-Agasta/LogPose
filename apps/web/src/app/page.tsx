"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HomeNavbar } from "@/components/home/home-navbar";
import InteractiveArgoMap from "@/components/home/interactive-argo-map";
import { Sidebar, type SidebarFilters } from "@/components/home/sidebar";
import { fetchFloatLocations } from "@/lib/utils";
import type { FloatLocationsResponse } from "@LogPose/schema/api/home-page";

export default function Home() {
  const [floatLocations, setFloatLocations] = useState<FloatLocationsResponse["data"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SidebarFilters | null>(null);

  // Fetch float locations once at the top level
  useEffect(() => {
    const loadFloatLocations = async () => {
      try {
        setIsLoading(true);
        const response = await fetchFloatLocations();
        setFloatLocations(response.data);
      } catch (error) {
        console.error("Failed to fetch float locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFloatLocations();
  }, []);

  // Handle filter changes from sidebar
  const handleFiltersChange = useCallback((newFilters: SidebarFilters) => {
    setFilters(newFilters);
  }, []);

  // Helper function to get cutoff date based on time period
  const getTimePeriodCutoffDate = (timePeriod: string): Date | null => {
    const now = new Date();
    switch (timePeriod) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "5y":
        return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      case "10y":
        return new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      case "all":
      default:
        return null; // No cutoff, show all
    }
  };

  // Apply filters to float locations
  const filteredFloatLocations = useMemo(() => {
    if (!filters) return floatLocations;

    return floatLocations.filter((float) => {
      // Time period filter
      if (filters.timePeriod && filters.timePeriod !== "all") {
        const cutoffDate = getTimePeriodCutoffDate(filters.timePeriod);
        if (cutoffDate && float.lastUpdate) {
          const floatDate = new Date(float.lastUpdate);
          if (floatDate < cutoffDate) return false;
        }
      }

      // Custom date range filter (if custom range is set and valid)
      if (filters.customRange.start || filters.customRange.end) {
        if (float.lastUpdate) {
          const floatDate = new Date(float.lastUpdate);
          if (filters.customRange.start && floatDate < filters.customRange.start) return false;
          if (filters.customRange.end && floatDate > filters.customRange.end) return false;
        }
      }

      // Status filter
      const statusFiltersActive = filters.status.all || filters.status.active || filters.status.inactive;
      if (statusFiltersActive) {
        const statusMatch =
          (filters.status.all) ||
          (filters.status.active && float.status === "ACTIVE") ||
          (filters.status.inactive && float.status === "INACTIVE");
        if (!statusMatch) return false;
      }

      // Network/Type filter
      const networkFiltersActive = filters.network.bgcArgo || filters.network.coreArgo || filters.network.deepArgo;
      if (networkFiltersActive) {
        const networkMatch =
          (filters.network.bgcArgo && float.floatType === "biogeochemical") ||
          (filters.network.coreArgo && float.floatType === "core") ||
          (filters.network.deepArgo && float.floatType === "deep");
        if (!networkMatch) return false;
      }

      // Platform ID search filter
      if (filters.platformId && filters.platformId.trim() !== "") {
        const searchTerm = filters.platformId.toLowerCase().trim();
        const floatIdMatch = String(float.floatId).toLowerCase().includes(searchTerm);
        if (!floatIdMatch) return false;
      }

      return true;
    });
  }, [floatLocations, filters]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map Layer */}
      <div className="fixed inset-0 z-10">
        <InteractiveArgoMap floatLocations={filteredFloatLocations} isLoading={isLoading} />
      </div>

      {/* Navigation Sidebar - high z-index to be above map */}
      <Sidebar
        className="z-100"
        floatLocations={floatLocations}
        onFiltersChange={handleFiltersChange}
      />

      {/* Floating Dock Navbar - high z-index to be above map */}
      <HomeNavbar />
    </div>
  );
}