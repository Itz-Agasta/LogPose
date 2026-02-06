import { agentQueryInputSchema } from "@LogPose/schema/api/agent";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { DuckDBAgent } from "@/agents/duckdb-agent";
import { executeGeneralAgent } from "@/agents/general-agent";
import { RAGAgent } from "@/agents/rag-agent";
import type { RoutingDecision } from "@/agents/router-agent";
import { routeQuery } from "@/agents/router-agent";
import { SQLAgent } from "@/agents/sql-agent";
import { responseOrchestrator } from "@/agents/orchestrator";
import { buildAgentMetrics } from "@/utils/helper";
import { sqlAgentRouter } from "./sql-agent";
import { duckdbAgentRouter } from "./duckdb-agent";

const HTTP_STATUS_INTERNAL_ERROR = 500;

/**
 * Execute agents in parallel based on routing decision
 */
async function executeAgents(params: {
  routing: RoutingDecision;
  query: string;
}) {
  const { routing, query } = params;

  const [sqlResults, duckdbResults, ragResults] = await Promise.all([
    routing.sqlAgent ? SQLAgent({ query }) : Promise.resolve(undefined),
    routing.duckdbAgent ? DuckDBAgent({ query }) : Promise.resolve(undefined),
    routing.ragAgent ? RAGAgent({ query }) : Promise.resolve(undefined),
  ]);

  return { sqlResults, duckdbResults, ragResults };
}

export const agentRouter = new Hono();

// Mount separate agent routers
agentRouter.route("/sql", sqlAgentRouter);
agentRouter.route("/duckdb", duckdbAgentRouter);

/**
 * Main query endpoint for the multi-agent system that intelligently routes queries
 * through classifier, SQL agent, RAG agent, and response orchestrator.
 *
 * All query parameters (floatId, timeRange, etc.) are automatically extracted by agents
 * from the natural language query itself.
 *
 * @URL `POST /api/v1/agent/query`
 */
agentRouter.post(
  "/query",
  zValidator("json", agentQueryInputSchema),
  async (c) => {
    const startTime = Date.now();
    const input = c.req.valid("json");
    const { query } = input;

    try {
      // Step 1: Route query to appropriate agents
      const routingStart = Date.now();
      const routing = await routeQuery(query);
      const routingTime = Date.now() - routingStart;

      // Step 2: Handle general queries (greetings, casual chat)
      if (
        routing.generalAgent &&
        !routing.sqlAgent &&
        !routing.duckdbAgent &&
        !routing.ragAgent
      ) {
        const generalResponse = await executeGeneralAgent(query);
        // const totalTime = Date.now() - startTime;

        return c.json({
          success: true,
          query,
          // routing,
          response: generalResponse.response,
          // citations: null,
          timestamp: new Date(),
          // agentMetrics: buildAgentMetrics({
          //   routing: { decision: routing, timeMs: routingTime },
          //   generalResult: generalResponse,
          //   totalTime,
          // }),
        });
      }

      // Step 3: Execute specialized agents in parallel
      const { sqlResults, duckdbResults, ragResults } = await executeAgents({
        routing,
        query,
      });

      // Step 4: Orchestrate final response
      const orchestrationStart = Date.now();
      const finalResponse = await responseOrchestrator({
        originalQuery: query,
        sqlResults,
        duckdbResults,
        ragResults,
      });
      const orchestrationTime = Date.now() - orchestrationStart;
      const totalTime = Date.now() - startTime;

      // Step 5: Collect metrics from all agents (they already tracked their own time/tokens)
      // @ts-expect-error debug variable
      const _agentMetrics = buildAgentMetrics({
        routing: { decision: routing, timeMs: routingTime },
        sqlResults,
        duckdbResults,
        ragResults,
        orchestration: { result: finalResponse, timeMs: orchestrationTime },
        totalTime,
      });

      // TODO: use zod to send minimum data.---> response, sqlResults.data, duckdbResults.data & citations
      return c.json({
        success: true,
        query,
        // routing,
        sqlResults: sqlResults || null,
        duckdbResults: duckdbResults || null,
        // ragResults: ragResults || null,
        response: finalResponse.response,
        // citations: finalResponse.citations,
        timestamp: finalResponse.timestamp,
        // _agentMetrics,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          query,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
          timestamp: new Date(),
        },
        HTTP_STATUS_INTERNAL_ERROR,
      );
    }
  },
);
