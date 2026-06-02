import { promises as fs } from "node:fs";
import * as path from "node:path";

import { FileMigrationProvider, Migrator } from "kysely/migration";

import { db } from "../index.ts";

export const migrate = async () => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, "../migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(({ migrationName, status }) => {
    if (status === "Success") console.log(`[migrate] ✓ ${migrationName}`);
    else if (status === "Error") console.error(`[migrate] ✗ ${migrationName}`);
  });

  if (error) {
    console.error("[migrate] Failed:", error);
    await db.destroy();
    process.exit(1);
  }

  if (!results?.length) {
    console.log("[migrate] No pending migrations");
  }
};
