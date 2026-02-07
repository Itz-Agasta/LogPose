import { z } from "zod";

/**
 * Schema for a single measurement row from DuckDB parquet data
 * Maps to the argo_measurements table in DuckDB
 */
export const profileMeasurementSchema = z.object({
  pressure: z.number(),
  temperature: z.number(),
  salinity: z.number(),
  oxygen: z.number().nullable().optional(),
  chlorophyll: z.number().nullable().optional(),
  nitrate: z.number().nullable().optional(),
});

/**
 * Schema for float profile metadata
 * Combines PG metadata + status info for the profile page sidebar
 */
export const floatProfileMetadataSchema = z.object({
  floatId: z.number(),
  wmoNumber: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "UNKNOWN", "DEAD"]),
  floatType: z.enum(["core", "oxygen", "biogeochemical", "deep", "unknown"]),
  platformType: z.string().optional(),
  platformMaker: z.string().optional(),
  operatingInstitution: z.string().optional(),
  piName: z.string().optional(),
  dataCentre: z.string().optional(),
  projectName: z.string().optional(),
  launchDate: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  cycleNumber: z.number().optional(),
  lastUpdate: z.string().optional(),
  dataMode: z.string().optional(),
  totalCycles: z.number().optional(),
  totalLevels: z.number().optional(),
});

/**
 * Schema for a single cycle's profile data
 */
export const cycleProfileSchema = z.object({
  cycleNumber: z.number(),
  timestamp: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  dataMode: z.string().optional(),
  measurements: z.array(profileMeasurementSchema),
});

/**
 * Full profile response: metadata + measurement data for the latest cycle
 */
export const floatProfileResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    metadata: floatProfileMetadataSchema,
    latestCycle: cycleProfileSchema,
    availableCycles: z.array(z.number()),
  }),
  timestamp: z.string(),
});

/**
 * Response for a specific cycle's profile data
 */
export const cycleProfileResponseSchema = z.object({
  success: z.boolean(),
  data: cycleProfileSchema,
  timestamp: z.string(),
});

// Export inferred types
export type ProfileMeasurement = z.infer<typeof profileMeasurementSchema>;
export type FloatProfileMetadata = z.infer<typeof floatProfileMetadataSchema>;
export type CycleProfile = z.infer<typeof cycleProfileSchema>;
export type FloatProfileResponse = z.infer<typeof floatProfileResponseSchema>;
export type CycleProfileResponse = z.infer<typeof cycleProfileResponseSchema>;
