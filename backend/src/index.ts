import "@sinclair/typebox/compiler";

import { node } from "@elysia/node";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { notesController } from "./controllers/notes.ts";
import { patientsController } from "./controllers/patients.ts";
import { generateTypes } from "./db/scripts/generate-types.ts";
import { migrate } from "./db/scripts/migrate.ts";
import { seed } from "./db/scripts/seed.ts";
import env from "./env.ts";

await migrate();
if (!env.isProd) generateTypes();
await seed();

export const app = new Elysia({ adapter: node() })
  .use(cors())
  .use(swagger())
  .use(patientsController)
  .use(notesController)
  .compile()
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${String(hostname)}:${String(port)}!!!`);
  });
