import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { generateTypes } from "./db/scripts/generate-types.ts";
import { migrate } from "./db/scripts/migrate.ts";
import { seed } from "./db/scripts/seed.ts";
import env from "./env.ts";

if (!env.isProd) {
  generateTypes();
  await migrate();
  await seed();
}

const app = new Elysia({ adapter: node() }).listen(3000, ({ hostname, port }) => {
  console.log(`🦊 Elysia is running at ${String(hostname)}:${String(port)}!!!`);
});

app.get("/", (req, res, ...args) => {
  console.log(req, res, args);

  return "Hello";
});
