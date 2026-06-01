import { Elysia } from "elysia";
import { node } from "@elysia/node";
import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve(import.meta.dirname, "../.env"),
});

export const app = new Elysia({ adapter: node() })
  .get("/", () => "Hello Elysia!!!")
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${String(hostname)}:${String(port)}!!!`);
  });
