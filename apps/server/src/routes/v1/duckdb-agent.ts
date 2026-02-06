import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { DuckDBAgent } from "@/agents/duckdb-agent";

const HTTP_STATUS_INTERNAL_ERROR = 500;

/**
 * Input schema for DuckDB agent query
 */
const duckdbQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty")
    .describe(
      "Natural language query for Argo float profile data analysis. The agent specializes in querying Parquet files stored in R2 using DuckDB for temperature, salinity, pressure profiles over depth and time.",
    ),
  dryRun: z
    .boolean()
    .optional()
    .default(false)
    .describe("If true, generates SQL without executing it"),
});

/**
 * Input schema for DuckDB dry-run test endpoint
 */
const duckdbTestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export const duckdbAgentRouter = new Hono();

/**
 * Execute a DuckDB query against Argo float profile data
 * Queries Parquet files stored in R2 for oceanographic measurements
 *
 * @URL `POST /api/v1/agent/duckdb/query`
 */
duckdbAgentRouter.post("/query", zValidator("json", duckdbQuerySchema), async (c) => {
  const input = c.req.valid("json");
  const { query, dryRun } = input;

  try {
    const result = await DuckDBAgent({ query, dryRun });

    return c.json({
      success: result.success,
      query,
      sql: result.sql,
      data: result.data || null,
      rowCount: result.rowCount || 0,
      tokensUsed: result.tokensUsed,
      timings: result.timings,
      error: result.error,
      timestamp: new Date(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        query,
        error: error instanceof Error ? error.message : "Unknown DuckDB agent error",
        timestamp: new Date(),
      },
      HTTP_STATUS_INTERNAL_ERROR,
    );
  }
});

/**
 * Test DuckDB agent with dry run (generates SQL without executing)
 * Useful for debugging and validating generated SQL queries
 *
 * @URL `GET /api/v1/agent/duckdb/test`
 */
duckdbAgentRouter.get("/test", zValidator("query", duckdbTestSchema), async (c) => {
  const input = c.req.valid("query");

  try {
    const result = await DuckDBAgent({ query: input.query, dryRun: true });

    return c.json({
      success: result.success,
      sql: result.sql,
      tokensUsed: result.tokensUsed,
      timings: result.timings,
      error: result.error,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown DuckDB agent error",
      },
      HTTP_STATUS_INTERNAL_ERROR,
    );
  }
});
