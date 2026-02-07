import type { TamboComponent, TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Import the components that will be used for generative UI
import FloatDataCard from "@/components/tambo/float-data-card";
import OceanStatsCard from "@/components/tambo/ocean-stats-card";
import FloatLocationMap from "@/components/tambo/float-location-map";
import DataTable from "@/components/tambo/data-table";
import { Graph, graphSchema } from "@/components/tambo/graph";
import { FormComponent as Form, formSchema } from "@/components/tambo/form";

// Import the agent query functions
import { queryAgent, querySQLAgent, queryDuckDBAgent } from "@/lib/utils";

/**
 * Tambo generative components for the LogPose application
 * These components can be dynamically rendered by the AI based on user queries
 *
 * Note: All nested fields are marked optional and nullable to handle streaming partial props.
 * Components should use optional chaining (?.) and nullish coalescing (??) for all props.
 */
export const components: TamboComponent[] = [
  {
    name: "FloatDataCard",
    description:
      "Displays detailed information about a specific Argo float including its ID, status, location, type, and recent measurements. Use this when the user asks about a specific float's details, status, or measurements.",
    component: FloatDataCard,
    propsSchema: z.object({
      floatId: z.number().nullable().optional().describe("The unique identifier of the float"),
      wmoNumber: z.string().nullable().optional().describe("WMO number of the float"),
      status: z
        .string()
        .nullable()
        .optional()
        .describe(
          "Current operational status of the float: 'ACTIVE', 'INACTIVE', 'UNKNOWN', or 'DEAD'",
        ),
      floatType: z
        .string()
        .nullable()
        .optional()
        .describe("Type of Argo float: 'core', 'oxygen', 'biogeochemical', 'deep', or 'unknown'"),
      latitude: z.number().nullable().optional().describe("Current latitude position"),
      longitude: z.number().nullable().optional().describe("Current longitude position"),
      cycleNumber: z.number().nullable().optional().describe("Current cycle number"),
      lastUpdate: z.string().nullable().optional().describe("ISO date string of last update"),
      temperature: z
        .number()
        .nullable()
        .optional()
        .describe("Last recorded temperature in Celsius"),
      salinity: z.number().nullable().optional().describe("Last recorded salinity in PSU"),
      depth: z.number().nullable().optional().describe("Last recorded depth in meters"),
      piName: z.string().nullable().optional().describe("Principal investigator name"),
      institution: z.string().nullable().optional().describe("Operating institution"),
    }),
  },
  {
    name: "OceanStatsCard",
    description:
      "Displays aggregated statistics about ocean data or Argo float network. Use this when the user asks about overall statistics, summaries, or network-wide data.",
    component: OceanStatsCard,
    propsSchema: z.object({
      title: z.string().nullable().optional().describe("Title of the statistics card"),
      stats: z
        .array(
          z.object({
            label: z.string().nullable().optional().describe("Label for the statistic"),
            value: z
              .union([z.string(), z.number()])
              .nullable()
              .optional()
              .describe("Value of the statistic"),
            unit: z.string().nullable().optional().describe("Unit of measurement"),
            change: z
              .number()
              .nullable()
              .optional()
              .describe("Percentage change from previous period"),
            trend: z
              .string()
              .nullable()
              .optional()
              .describe("Trend direction: 'up', 'down', or 'stable'"),
          }),
        )
        .nullable()
        .optional()
        .describe("Array of statistics to display"),
      description: z.string().nullable().optional().describe("Optional description or context"),
    }),
  },
  {
    name: "FloatLocationMap",
    description:
      "Displays a Mapbox satellite map showing the location of one or more floats with proper map textures and zoom. Use this when the user asks about float locations, wants to visualize where floats are positioned in a specific region (like Bay of Bengal, Arabian Sea, etc.), or asks to show floats in a certain area. The map will automatically zoom to fit the floats and show satellite imagery.",
    component: FloatLocationMap,
    propsSchema: z.object({
      locations: z
        .array(
          z.object({
            floatId: z.number().nullable().optional().describe("Float identifier"),
            latitude: z.number().nullable().optional().describe("Latitude coordinate"),
            longitude: z.number().nullable().optional().describe("Longitude coordinate"),
            status: z
              .string()
              .nullable()
              .optional()
              .describe("Float status: 'ACTIVE', 'INACTIVE', 'UNKNOWN', or 'DEAD'"),
            floatType: z
              .string()
              .nullable()
              .optional()
              .describe("Type of float: 'core', 'oxygen', 'biogeochemical', 'deep', or 'unknown'"),
          }),
        )
        .nullable()
        .optional()
        .describe("Array of float locations to display on the map"),
      centerLat: z
        .number()
        .nullable()
        .optional()
        .describe(
          "Center latitude for the map view (optional, auto-calculated from locations if not provided)",
        ),
      centerLng: z
        .number()
        .nullable()
        .optional()
        .describe(
          "Center longitude for the map view (optional, auto-calculated from locations if not provided)",
        ),
      zoom: z
        .number()
        .nullable()
        .optional()
        .describe("Initial zoom level 1-18 (optional, auto-calculated based on location spread)"),
      title: z.string().nullable().optional().describe("Custom title for the map card"),
      regionName: z
        .string()
        .nullable()
        .optional()
        .describe("Name of the region being displayed (e.g., 'Bay of Bengal', 'Arabian Sea')"),
    }),
  },
  {
    name: "DataTable",
    description:
      "Displays tabular data with columns and rows. Use this when the user asks for data in a table format or when comparing multiple items. Each row should have a cells array with values corresponding to each column in order.",
    component: DataTable,
    propsSchema: z.object({
      title: z.string().nullable().optional().describe("Title for the table"),
      columns: z
        .array(
          z.object({
            key: z.string().nullable().optional().describe("Optional key for the column"),
            label: z.string().nullable().optional().describe("Display label for the column header"),
            align: z
              .string()
              .nullable()
              .optional()
              .describe("Text alignment: 'left', 'center', or 'right'. Defaults to 'left'"),
          }),
        )
        .nullable()
        .optional()
        .describe("Column definitions"),
      rows: z
        .array(
          z.object({
            cells: z
              .array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
              .nullable()
              .optional()
              .describe(
                "Array of cell values, one for each column in the same order as columns array",
              ),
          }),
        )
        .nullable()
        .optional()
        .describe("Array of row objects, each containing a cells array"),
      maxRows: z.number().nullable().optional().describe("Maximum number of rows to display"),
    }),
  },
  {
    name: "Graph",
    description:
      "Displays data as charts (bar, line, or pie) using Recharts. Use this for visualizing oceanographic data such as temperature/salinity profiles over depth, time-series data over cycles, trends, and comparisons. Best for numerical data that benefits from visual representation.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "Form",
    description:
      "An AI-powered form component for collecting user input. Use this when you need to gather structured information from the user, such as search filters, data entry, or configuration options. Supports various field types including text, number, select, textarea, radio, checkbox, slider, and yes/no inputs.",
    component: Form,
    propsSchema: formSchema,
  },
];

/**
 * Tambo tools for fetching and processing Argo float data
 *
 * ROUTING GUIDELINES (Tambo should follow these to choose the right tool):
 *
 * 1. SQL Agent Tool - For float METADATA and CURRENT STATUS:
 *    - Float identity, WMO number, type, deployment info
 *    - Current status: ACTIVE, INACTIVE, DEAD, UNKNOWN
 *    - Current/latest readings: last_temp, last_salinity, last_depth, battery_percent
 *    - Location queries: "Where is float X?", "Floats near Sri Lanka"
 *    - Fleet statistics: "How many active floats?", "Floats by project"
 *    - Spatial queries using PostGIS
 *
 * 2. DuckDB Agent Tool - For HISTORICAL PROFILE DATA:
 *    - Temperature/salinity/pressure profiles over depth
 *    - Time-series data across multiple cycles
 *    - Trends and historical analysis
 *    - Depth profiles and vertical structure
 *    - Multi-cycle comparisons
 *
 * 3. If query combines both (e.g., "Where is float X and show its temperature trends"):
 *    - Use BOTH tools
 */
export const tools: TamboTool[] = [
  {
    name: "query-float-metadata",
    description: `Query Argo float METADATA and CURRENT STATUS from PostgreSQL database.

USE THIS TOOL FOR:
- Float identity: WMO number, float type, project name, PI name, institution
- Current status: Is float active/inactive/dead?
- Current location: Where is float X? Show floats in Indian Ocean
- Latest readings: Current temperature, salinity, depth, battery level
- Spatial queries: Floats near a location, floats within X km of a point
- Fleet statistics: Count of floats, floats by project, low battery floats
- Deployment info: Launch date, start/end mission dates

EXAMPLE QUERIES THIS HANDLES:
- "Where is float 2902226?"
- "Show all active floats in the Bay of Bengal"
- "Which floats have low battery?"
- "How many biogeochemical floats are active?"
- "List floats operated by INCOIS"
- "Find floats within 500km of Mumbai"

DO NOT USE FOR: Historical profiles, time-series data, trends over multiple cycles`,
    tool: async ({ query }: { query: string }) => {
      const result = await querySQLAgent(query);

      return {
        success: result.success,
        response: result.success
          ? `Found ${result.rowCount ?? 0} results from metadata query`
          : result.error,
        data: result.data ?? null,
        rowCount: result.rowCount ?? 0,
        sql: result.sql ?? null,
        error: result.error,
        timestamp: result.timestamp,
      };
    },
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Natural language question about float metadata, current status, location, or fleet statistics",
        ),
    }),
    outputSchema: z.object({
      success: z.boolean().describe("Whether the query was successful"),
      response: z.string().nullable().describe("Summary of the query results"),
      data: z
        .array(z.record(z.string(), z.unknown()))
        .nullable()
        .describe("Query results from PostgreSQL"),
      rowCount: z.number().describe("Number of rows returned"),
      sql: z.string().nullable().describe("The SQL query that was executed"),
      error: z.string().optional().describe("Error message if query failed"),
      timestamp: z.string().optional().describe("Timestamp of the response"),
    }),
  },
  {
    name: "query-oceanographic-profiles",
    description: `Query HISTORICAL OCEANOGRAPHIC PROFILE DATA from DuckDB/Parquet files.

USE THIS TOOL FOR:
- Temperature profiles: T vs depth, T vs time
- Salinity profiles: S vs depth, S vs time
- Pressure/depth data across cycles
- Time-series analysis: How has temperature changed over cycles?
- Vertical structure: Show the water column profile
- Multi-cycle comparisons: Compare cycle 1 vs cycle 50
- Trend analysis: Temperature trends at 1000m depth
- Quality-filtered scientific data (adjusted values, QC flags)
- DATA FOR GRAPHS: Use this tool to get data, then render with Graph component

EXAMPLE QUERIES THIS HANDLES:
- "Show temperature profile for float 2902235 cycle 42"
- "Plot surface temperature over time for float X"
- "What's the temperature trend at 1000m depth?"
- "Compare salinity profiles between cycles 10 and 50"
- "Show the full water column profile"
- "Get temperature time series for the last 20 cycles"
- "Graph the temperature vs depth profile"

GRAPHING: When user asks to plot/graph/visualize profile data:
1. Use this tool to retrieve the data
2. Use the Graph component to visualize it with type='line' for profiles/trends, type='bar' for comparisons

DO NOT USE FOR: Current float status, location, battery, fleet counts, metadata`,
    tool: async ({ query }: { query: string }) => {
      const result = await queryDuckDBAgent(query);

      // Transform data for easier graph rendering
      const graphReadyData = result.data?.map((row) => {
        // Try to extract common oceanographic fields for graphing
        const depth = row.pressure ?? row.depth ?? row.level;
        const temp = row.temperature ?? row.temp ?? row.temperature_adj;
        const sal = row.salinity ?? row.sal ?? row.salinity_adj;
        const cycle = row.cycle_number ?? row.cycle;

        return {
          ...row,
          // Normalized fields for graphing
          _depth: typeof depth === "number" ? depth : null,
          _temperature: typeof temp === "number" ? temp : null,
          _salinity: typeof sal === "number" ? sal : null,
          _cycle: typeof cycle === "number" ? cycle : null,
        };
      });

      return {
        success: result.success,
        response: result.success
          ? `Retrieved ${result.rowCount ?? 0} profile measurements. Data is ready for visualization with the Graph component.`
          : result.error,
        data: graphReadyData ?? null,
        rowCount: result.rowCount ?? 0,
        sql: result.sql ?? null,
        error: result.error,
        timestamp: result.timestamp,
      };
    },
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "Natural language question about historical oceanographic profiles, time-series, or trends",
        ),
    }),
    outputSchema: z.object({
      success: z.boolean().describe("Whether the query was successful"),
      response: z.string().nullable().describe("Summary of the profile data retrieved"),
      data: z
        .array(z.record(z.string(), z.unknown()))
        .nullable()
        .describe("Profile data from DuckDB/Parquet files"),
      rowCount: z.number().describe("Number of measurements returned"),
      sql: z.string().nullable().describe("The DuckDB SQL query that was executed"),
      error: z.string().optional().describe("Error message if query failed"),
      timestamp: z.string().optional().describe("Timestamp of the response"),
    }),
  },
  {
    name: "search-oceanographic-research",
    description:
      "Search for oceanographic research papers and scientific literature related to Argo floats and ocean science. Use this when the user asks about research, papers, scientific findings, methodology, calibration procedures, or wants citations.",
    tool: async ({ query }: { query: string }) => {
      // Enhance the query to focus on research/literature
      const researchQuery = `Find research papers and scientific literature about: ${query}`;
      const result = await queryAgent(researchQuery);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
          response: null,
        };
      }

      return {
        success: true,
        response: result.response,
        timestamp: result.timestamp,
      };
    },
    inputSchema: z.object({
      query: z
        .string()
        .describe("Research topic or question to search for in oceanographic literature"),
    }),
    outputSchema: z.object({
      success: z.boolean().describe("Whether the search was successful"),
      response: z
        .string()
        .nullable()
        .describe("Research findings and citations from the literature search"),
      error: z.string().optional().describe("Error message if search failed"),
      timestamp: z.string().optional().describe("Timestamp of the response"),
    }),
  },
];
