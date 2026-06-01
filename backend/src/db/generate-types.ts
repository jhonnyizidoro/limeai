import { execSync } from "node:child_process";
import { resolve } from "node:path";
import env from "../env.js";

const url = `postgresql://${env.db.user}:${env.db.password}@${env.db.host}:${env.db.port}/${env.db.name}`;

execSync(`kysely-codegen --url "${url}" --out-file src/db/types.ts`, {
  stdio: "inherit",
  cwd: resolve(import.meta.dirname, ".."),
});
