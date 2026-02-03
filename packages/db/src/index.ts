import { env } from "@LogPose/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db = drizzle(env.PG_READ_URL, { schema });
