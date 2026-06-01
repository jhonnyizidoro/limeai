import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { swagger } from "@elysiajs/swagger";
import { generateTypes } from "./db/scripts/generate-types.ts";
import { migrate } from "./db/scripts/migrate.ts";
import { seed } from "./db/scripts/seed.ts";
import env from "./env.ts";
import { patientsController } from "./controllers/patients.ts";
import { notesController } from "./controllers/notes.ts";

if (!env.isProd) {
  await migrate();
  generateTypes();
  await seed();
}

export const app = new Elysia({ adapter: node() })
  .use(swagger())
  .use(patientsController)
  .use(notesController)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${String(hostname)}:${String(port)}!!!`);
  });
