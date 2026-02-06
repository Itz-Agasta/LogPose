import type {
  FloatDetailResponse,
  FloatLocationsResponse,
} from "@LogPose/schema/api/home-page";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Response type for the agent query endpoint
 */
export type AgentQueryResponse =
  | {
      success: true;
      query: string;
      sqlResults?: {
        success: boolean;
        sql?: string;
        data?: unknown[];
        error?: string;
      } | null;
      duckdbResults?: {
        success: boolean;
        sql?: string;
        data?: unknown[];
        error?: string;
      } | null;
      response: string;
      timestamp: string;
    }
  | {
      success: false;
      query: string;
      error: string;
      timestamp: string;
    };

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
  floatId: number,
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

/**
 * Query the multi-agent system with a natural language question
 * POST /api/v1/agent/query
 *
 * The agent system intelligently routes queries through:
 * - SQL Agent: For database queries about Argo float data
 * - DuckDB Agent: For analytical queries on Parquet files
 * - RAG Agent: For research paper lookups
 * - General Agent: For greetings and casual conversation
 *
 * @param query - Natural language question about Argo floats or oceanographic data
 * @returns Agent response with optional SQL results and formatted answer
 */
export async function queryAgent(query: string): Promise<AgentQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/agent/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to query agent: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Test SQL generation without executing (dry run)
 * GET /api/v1/agent/test-sql
 *
 * @param query - Natural language question to convert to SQL
 * @param agent - Which SQL agent to test ('pg' for PostgreSQL or 'duckdb')
 * @returns Generated SQL without execution
 */
export async function testAgentSQL(
  query: string,
  agent: "pg" | "duckdb",
): Promise<{ success: boolean; sql?: string; error?: string }> {
  const params = new URLSearchParams({ query, agent });
  const response = await fetch(`${API_BASE_URL}/agent/test-sql?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to test SQL: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Response type for SQL agent query
 */
export type SQLAgentResponse = {
  success: boolean;
  query: string;
  sql?: string;
  data?: Record<string, unknown>[] | null;
  rowCount?: number;
  tokensUsed?: number;
  timings?: {
    llmResponse?: number;
    dbExecution?: number;
    total: number;
  };
  error?: string;
  timestamp: string;
};

/**
 * Response type for DuckDB agent query
 */
export type DuckDBAgentResponse = {
  success: boolean;
  query: string;
  sql?: string;
  data?: Record<string, unknown>[] | null;
  rowCount?: number;
  tokensUsed?: number;
  timings?: {
    llmResponse?: number;
    dbExecution?: number;
    total: number;
  };
  error?: string;
  timestamp: string;
};

/**
 * Query the SQL agent for Argo float metadata and current status
 * POST /api/v1/agent/sql/query
 *
 * Use this for:
 * - Float identity, location, deployment info
 * - Current status (ACTIVE, INACTIVE, DEAD, UNKNOWN)
 * - Latest readings: last_temp, last_salinity, last_depth, battery_percent
 * - Spatial queries (near X location, in region Y)
 * - Fleet statistics and summaries
 *
 * @param query - Natural language question about float metadata or status
 * @param dryRun - If true, generates SQL without executing
 * @returns SQL agent response with query results
 */
export async function querySQLAgent(
  query: string,
  dryRun = false,
): Promise<SQLAgentResponse> {
  const response = await fetch(`${API_BASE_URL}/agent/sql/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, dryRun }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to query SQL agent: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Query the DuckDB agent for historical oceanographic profile data
 * POST /api/v1/agent/duckdb/query
 *
 * Use this for:
 * - Temperature/salinity/pressure profiles across cycles
 * - Time-series analysis and trends over time
 * - Depth profiles and vertical structure
 * - Multi-cycle comparisons
 * - Quality-filtered historical data
 *
 * @param query - Natural language question about historical profile data
 * @param dryRun - If true, generates SQL without executing
 * @returns DuckDB agent response with query results
 */
export async function queryDuckDBAgent(
  query: string,
  dryRun = false,
): Promise<DuckDBAgentResponse> {
  const response = await fetch(`${API_BASE_URL}/agent/duckdb/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, dryRun }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Failed to query DuckDB agent: ${response.statusText}`,
    );
  }

  return response.json();
}
