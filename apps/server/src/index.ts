import { config } from "./config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiRouter } from "./routes/router";
import pinoLogger, { logger } from "./middlewares/logger";

const app = new Hono();

// 1. CORS must come BEFORE basePath and other middleware
app.use(
  "*",
  cors({
    origin: config.CORS_ORIGIN || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// 2. Then logger and basePath
app.use(pinoLogger);

// 3. Routes with basePath
const api = new Hono().basePath("/api");

api.get("/", (c) => {
  return c.json("OK from Vyse");
});

api.route("/", apiRouter);

api.get("/error", (c) => {
  c.status(422);
  logger.warn("error");
  throw new Error("oh no");
});

// 4. Mount the API routes
app.route("/", api);

// 5. Global error handlers
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
      stack: config.NODE_ENV === "production" ? null : err.stack,
    },
    500,
  );
});

export default app;
