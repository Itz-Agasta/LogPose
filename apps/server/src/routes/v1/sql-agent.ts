import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { SQLAgent } from "@/agents/sql-agent";

const HTTP_STATUS_INTERNAL_ERROR = 500;

/**
 * Schema for SQL agent query input
 */
const sqlAgentQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty")
    .describe("Natural language query for PostgreSQL/PostGIS metadata queries"),
  dryRun: z
    .boolean()
    .optional()
    .default(false)
    .describe("If true, generates SQL without executing"),
});

export const sqlAgentRouter = new Hono();

/**
 * Execute SQL agent query against PostgreSQL for Argo float metadata
 * Handles float identity, status, location, battery, deployment info, and fleet statistics
 *
 * @URL `POST /api/v1/agent/sql/query`
 */
sqlAgentRouter.post("/query", zValidator("json", sqlAgentQuerySchema), async (c) => {
  const input = c.req.valid("json");
  const { query, dryRun } = input;

  try {
    const result = await SQLAgent({ query, dryRun });

    return c.json({
      success: result.success,
      query,
      sql: result.sql,
      data: result.data ?? null,
      rowCount: result.rowCount ?? 0,
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
        error: error instanceof Error ? error.message : "Unknown SQL agent error",
        timestamp: new Date(),
      },
      HTTP_STATUS_INTERNAL_ERROR,
    );
  }
});

/**
 * Test SQL agent with dry run (generates SQL without executing)
 * Useful for debugging and validating generated queries
 *
 * @URL `GET /api/v1/agent/sql/test`
 */
sqlAgentRouter.get(
  "/test",
  zValidator(
    "query",
    z.object({
      query: z.string().min(1, "Query cannot be empty"),
    }),
  ),
  async (c) => {
    const input = c.req.valid("query");

    try {
      const result = await SQLAgent({ query: input.query, dryRun: true });

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
          error: error instanceof Error ? error.message : "Unknown SQL agent error",
        },
        HTTP_STATUS_INTERNAL_ERROR,
      );
    }
  },
);
