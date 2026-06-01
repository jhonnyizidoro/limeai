import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import env from "@/env.js";
import type { DB } from "./types.ts";

const { Pool } = pg;

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: env.db.host,
      port: Number(env.db.port),
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
    }),
  }),
});
