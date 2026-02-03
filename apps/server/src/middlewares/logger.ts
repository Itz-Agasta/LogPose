import pino from "pino";
import { pinoLogger } from "hono-pino";
import type { DebugLogOptions } from "hono-pino/debug-log";

const options: DebugLogOptions = {
  colorEnabled: true,
};

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  base: null,
  ...(isProduction
    ? { level: "trace" }
    : {
        level: "info",
        transport: {
          target: "hono-pino/debug-log",
          options,
        },
      }),
  timestamp: pino.stdTimeFunctions.unixTime,
});

export default pinoLogger({
  pino: logger,
  http: { reqId: () => crypto.randomUUID() },
});
