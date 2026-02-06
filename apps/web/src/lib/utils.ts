import type {
  FloatDetailResponse,
  FloatLocationsResponse,
} from "@LogPose/schema/api/home-page";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const getApiBaseUrl = (): string => {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}/api`;
  }
  // Fallback to window.location.origin in browser, or localhost for SSR
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:3000/api";
};

const API_BASE_URL = getApiBaseUrl();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


/**
 * Fetch all float locations for map display
 * GET /api/home/locations
 */
export async function fetchFloatLocations(): Promise<FloatLocationsResponse> {
  const response = await fetch(`${API_BASE_URL}/home/locations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch float locations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch detailed information for a specific float
 * GET /api/home/float/:floatId
 */
export async function fetchFloatDetail(
  floatId: number
): Promise<FloatDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/home/float/${floatId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch float details: ${response.statusText}`);
  }

  return response.json();
}