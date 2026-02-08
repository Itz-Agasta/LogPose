import { db } from "@LogPose/db";
import { argo_float_metadata, argo_float_status } from "@LogPose/db/schema/index";
import type { CycleProfileResponse, FloatProfileResponse } from "@LogPose/schema/api/profile";

import { DuckDBInstance } from "@duckdb/node-api";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "env/server";
import { logger } from "../../middlewares/logger";

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_ERROR = 500;
const RADIX_DECIMAL = 10;

export const profileRouter = new Hono();

/**
 * Helper to create a DuckDB connection configured for R2 access
 */
async function createDuckDBConnection() {
  const instance = await DuckDBInstance.create(":memory:");
  const connection = await instance.connect();

  await connection.run("INSTALL httpfs;");
  await connection.run("LOAD httpfs;");

  await connection.run(`
    CREATE SECRET IF NOT EXISTS r2_secret (
      TYPE S3,
      KEY_ID '${env.S3_ACCESS_KEY}',
      SECRET '${env.S3_SECRET_KEY}',
      REGION '${env.S3_REGION}',
      ENDPOINT '${env.S3_ENDPOINT.replace("https://", "")}',
      URL_STYLE 'path'
    );
  `);

  return { instance, connection };
}

/**
 * Execute a query on an existing DuckDB connection
 */
async function runQuery(
  connection: Awaited<ReturnType<typeof createDuckDBConnection>>["connection"],
  sql: string,
): Promise<Record<string, unknown>[]> {
  const result = await connection.runAndReadAll(sql);
  // Use getRowsJson like the agent does - returns array of arrays
  const rows = result.getRowsJson() as unknown[][];
  const columnNames = result.columnNames();

  // Convert array of arrays to array of objects
  return rows.map((row) => {
    const obj: Record<string, unknown> = {};
    columnNames.forEach((name, index) => {
      obj[name] = row[index];
    });
    return obj;
  });
}

/**
 * GET /api/profile/:floatId
 *
 * Returns full profile page data: PG metadata + DuckDB latest cycle measurements
 */
profileRouter.get("/:floatId", async (c) => {
  try {
    const floatId = Number.parseInt(c.req.param("floatId"), RADIX_DECIMAL);

    if (Number.isNaN(floatId)) {
      return c.json({ success: false, error: "Invalid float ID" }, HTTP_STATUS_BAD_REQUEST);
    }

    // 1. Fetch metadata from PostgreSQL
    const metadataResult = await db
      .select({
        floatId: argo_float_metadata.float_id,
        wmoNumber: argo_float_metadata.wmo_number,
        status: argo_float_metadata.status,
        floatType: argo_float_metadata.float_type,
        platformType: argo_float_metadata.platform_type,
        operatingInstitution: argo_float_metadata.operating_institution,
        piName: argo_float_metadata.pi_name,
        dataCentre: argo_float_metadata.data_centre,
        projectName: argo_float_metadata.project_name,
        launchDate: argo_float_metadata.launch_date,
        location: argo_float_status.location,
        cycleNumber: argo_float_status.cycle_number,
        lastUpdate: argo_float_status.last_update,
      })
      .from(argo_float_metadata)
      .innerJoin(argo_float_status, eq(argo_float_metadata.float_id, argo_float_status.float_id))
      .where(eq(argo_float_metadata.float_id, floatId))
      .limit(1);

    if (!metadataResult.length) {
      return c.json({ success: false, error: "Float not found" }, HTTP_STATUS_NOT_FOUND);
    }

    const meta = metadataResult[0] as (typeof metadataResult)[0] & {
      location: NonNullable<(typeof metadataResult)[0]["location"]>;
    };

    // 2. Query DuckDB for available cycles and total levels
    const parquetPath = `s3://atlas/profiles/${floatId}/data.parquet`;

    const summarySQL = `
      SELECT 
        COUNT(DISTINCT cycle_number) AS total_cycles,
        COUNT(*) AS total_levels
      FROM read_parquet('${parquetPath}')
    `;

    const cyclesListSQL = `
      SELECT DISTINCT cycle_number
      FROM read_parquet('${parquetPath}')
      ORDER BY cycle_number DESC
    `;

    // 3. Get the latest cycle's profile data
    // Use ORDER BY DESC + LIMIT to avoid PlainSkip error from subqueries
    // Note: Selecting both base and _adj columns causes PlainSkip error, so use COALESCE
    const latestCycleSQL = `
      SELECT 
        cycle_number,
        profile_timestamp,
        latitude,
        longitude,
        data_mode,
        COALESCE(pressure_adj, pressure) AS pressure,
        COALESCE(temperature_adj, temperature) AS temperature,
        COALESCE(salinity_adj, salinity) AS salinity,
        oxygen,
        chlorophyll,
        nitrate,
        level
      FROM read_parquet('${parquetPath}')
      WHERE temperature IS NOT NULL
      ORDER BY cycle_number DESC, level ASC
      LIMIT 10000
    `;

    // Execute all DuckDB queries sequentially on a single connection
    let instance: Awaited<ReturnType<typeof DuckDBInstance.create>> | null = null;
    let connection: Awaited<ReturnType<typeof createDuckDBConnection>>["connection"] | null = null;

    try {
      const dbConnection = await createDuckDBConnection();
      instance = dbConnection.instance;
      connection = dbConnection.connection;

      const summaryRows = await runQuery(connection, summarySQL);
      const cycleRows = await runQuery(connection, cyclesListSQL);
      const latestRows = await runQuery(connection, latestCycleSQL);

      const summary = summaryRows[0] || { total_cycles: 0, total_levels: 0 };
      const availableCycles = cycleRows.map((r) => Number(r.cycle_number));

      // Parse latest cycle data - filter to only the max cycle
      const firstRow = latestRows[0];
      const latestCycleNumber = firstRow ? Number(firstRow.cycle_number) : 0;

      // Filter to only rows from the latest cycle (since ORDER BY DESC might include multiple cycles)
      const latestCycleRows = latestRows.filter(
        (r) => Number(r.cycle_number) === latestCycleNumber,
      );

      const latestTimestamp = firstRow?.profile_timestamp
        ? String(firstRow.profile_timestamp)
        : undefined;
      const latestLat = firstRow?.latitude != null ? Number(firstRow.latitude) : null;
      const latestLon = firstRow?.longitude != null ? Number(firstRow.longitude) : null;
      const latestDataMode = firstRow?.data_mode ? String(firstRow.data_mode) : undefined;

      const measurements = latestCycleRows
        .filter((r) => r.pressure != null && r.temperature != null)
        .map((r) => ({
          pressure: Number(r.pressure),
          temperature: Number(r.temperature),
          salinity: r.salinity != null ? Number(r.salinity) : 0,
          oxygen: r.oxygen != null ? Number(r.oxygen) : null,
          chlorophyll: r.chlorophyll != null ? Number(r.chlorophyll) : null,
          nitrate: r.nitrate != null ? Number(r.nitrate) : null,
        }));

      const response: FloatProfileResponse = {
        success: true,
        data: {
          metadata: {
            floatId: meta.floatId,
            wmoNumber: meta.wmoNumber,
            status: meta.status || "UNKNOWN",
            floatType: meta.floatType || "unknown",
            platformType: meta.platformType ?? undefined,
            operatingInstitution: meta.operatingInstitution ?? undefined,
            piName: meta.piName ?? undefined,
            dataCentre: meta.dataCentre ?? undefined,
            projectName: meta.projectName ?? undefined,
            launchDate: meta.launchDate?.toISOString() ?? undefined,
            latitude: meta.location.y,
            longitude: meta.location.x,
            cycleNumber: meta.cycleNumber ?? undefined,
            lastUpdate: meta.lastUpdate?.toISOString() ?? undefined,
            dataMode: latestDataMode,
            totalCycles: Number(summary.total_cycles) || 0,
            totalLevels: Number(summary.total_levels) || 0,
          },
          latestCycle: {
            cycleNumber: latestCycleNumber,
            timestamp: latestTimestamp,
            latitude: latestLat,
            longitude: latestLon,
            dataMode: latestDataMode,
            measurements,
          },
          availableCycles,
        },
        timestamp: new Date().toISOString(),
      };

      return c.json(response);
    } catch (duckErr) {
      logger.error({ error: duckErr }, "DuckDB error in profile fetch");
      throw duckErr;
    } finally {
      // Always close connections in finally block
      if (connection) {
        try {
          connection.closeSync();
        } catch (e) {
          logger.error({ error: e }, "Error closing DuckDB connection");
        }
      }
      if (instance) {
        try {
          instance.closeSync();
        } catch (e) {
          logger.error({ error: e }, "Error closing DuckDB instance");
        }
      }
    }
  } catch (error) {
    logger.error({ error }, "Error fetching float profile");
    return c.json(
      {
        success: false,
        error: "Failed to fetch float profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      HTTP_STATUS_INTERNAL_ERROR,
    );
  }
});

/**
 * GET /api/profile/:floatId/cycle/:cycleNumber
 *
 * Returns profile data for a specific cycle
 */
profileRouter.get("/:floatId/cycle/:cycleNumber", async (c) => {
  try {
    const floatId = Number.parseInt(c.req.param("floatId"), RADIX_DECIMAL);
    const cycleNumber = Number.parseInt(c.req.param("cycleNumber"), RADIX_DECIMAL);

    if (Number.isNaN(floatId) || Number.isNaN(cycleNumber)) {
      return c.json(
        { success: false, error: "Invalid float ID or cycle number" },
        HTTP_STATUS_BAD_REQUEST,
      );
    }

    const parquetPath = `s3://atlas/profiles/${floatId}/data.parquet`;

    // Note: Selecting both base and _adj columns causes PlainSkip error, so use COALESCE
    const cycleSQL = `
      SELECT 
        cycle_number,
        profile_timestamp,
        latitude,
        longitude,
        data_mode,
        COALESCE(pressure_adj, pressure) AS pressure,
        COALESCE(temperature_adj, temperature) AS temperature,
        COALESCE(salinity_adj, salinity) AS salinity,
        oxygen,
        chlorophyll,
        nitrate
      FROM read_parquet('${parquetPath}')
      WHERE cycle_number = ${cycleNumber}
      AND temperature IS NOT NULL
      ORDER BY level
      LIMIT 10000
    `;

    logger.info({ cycleSQL }, "Executing cycle query");

    let instance: Awaited<ReturnType<typeof DuckDBInstance.create>> | null = null;
    let connection: Awaited<ReturnType<typeof createDuckDBConnection>>["connection"] | null = null;
    let rows: Record<string, unknown>[] = [];

    try {
      const dbConnection = await createDuckDBConnection();
      instance = dbConnection.instance;
      connection = dbConnection.connection;

      rows = await runQuery(connection, cycleSQL);
      logger.info({ rowCount: rows.length }, "Query executed successfully");
    } catch (duckErr) {
      const errorMessage = duckErr instanceof Error ? duckErr.message : String(duckErr);
      logger.error({ error: errorMessage, sql: cycleSQL }, "DuckDB error in cycle fetch");
      throw duckErr;
    } finally {
      if (connection) {
        try {
          connection.closeSync();
        } catch (e) {
          logger.error({ error: e }, "Error closing DuckDB connection");
        }
      }
      if (instance) {
        try {
          instance.closeSync();
        } catch (e) {
          logger.error({ error: e }, "Error closing DuckDB instance");
        }
      }
    }

    if (!rows.length) {
      return c.json(
        { success: false, error: "No data found for this cycle" },
        HTTP_STATUS_NOT_FOUND,
      );
    }

    const measurements = rows
      .filter((r) => r.pressure != null && r.temperature != null)
      .map((r) => ({
        pressure: Number(r.pressure),
        temperature: Number(r.temperature),
        salinity: r.salinity != null ? Number(r.salinity) : 0,
        oxygen: r.oxygen != null ? Number(r.oxygen) : null,
        chlorophyll: r.chlorophyll != null ? Number(r.chlorophyll) : null,
        nitrate: r.nitrate != null ? Number(r.nitrate) : null,
      }));

    const response: CycleProfileResponse = {
      success: true,
      data: {
        cycleNumber,
        timestamp: rows[0]?.profile_timestamp ? String(rows[0].profile_timestamp) : undefined,
        latitude: rows[0]?.latitude != null ? Number(rows[0].latitude) : null,
        longitude: rows[0]?.longitude != null ? Number(rows[0].longitude) : null,
        dataMode: rows[0]?.data_mode ? String(rows[0].data_mode) : undefined,
        measurements,
      },
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  } catch (error) {
    logger.error({ error }, "Error fetching cycle profile");
    return c.json(
      {
        success: false,
        error: "Failed to fetch cycle profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      HTTP_STATUS_INTERNAL_ERROR,
    );
  }
});
