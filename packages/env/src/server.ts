import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    CORS_ORIGIN: z.string(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    // Db Related
    PG_READ_URL: z.string().min(1),
    // QDRANT_URL: z.string(),
    // QDRANT_API_KEY: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_ENDPOINT: z.string(),
    S3_BUCKET_NAME: z.string().default("atlas"),
    S3_REGION: z.string().default("auto"),

    // Agent
    GROQ_API_KEY: z.string(),
    AGENT: z.string().default("llama-3.3-70b-versatile"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
