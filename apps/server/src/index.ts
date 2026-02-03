import { env } from "@LogPose/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiRouter } from "./routes/router";

import pinoLogger, { logger } from "./middlewares/logger";

const app = new Hono().use(pinoLogger).basePath("/api");

app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.json("OK form Vyse");
});

app.route("/", apiRouter);

app.get("/error", (c) => {
  c.status(422);
  logger.warn("error");
  throw new Error("oh no");
});

app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Not Found - " + c.req.url,
    },
    404,
  );
});

app.onError((err, c) => {
  return c.json(
    {
      success: false,
      message: err.message,
      error: err,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
    500,
  );
});

export default app;
