import "dotenv/config";

export const config = {
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  NODE_ENV: process.env.NODE_ENV || "development",
  PG_READ_URL: process.env.PG_READ_URL,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "atlas",
  S3_REGION: process.env.S3_REGION || "auto",
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  AGENT: process.env.AGENT || "llama-3.3-70b-versatile",
};
