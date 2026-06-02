import { execSync } from "node:child_process";
import { resolve } from "node:path";

import env from "../../env.ts";

const url = `postgresql://${env.db.user}:${env.db.password}@${env.db.host}:${env.db.port}/${env.db.name}`;

export const generateTypes = () => {
  execSync(`kysely-codegen --url "${url}" --out-file ./types.ts`, {
    stdio: "inherit",
    cwd: resolve(import.meta.dirname, ".."),
  });
};
