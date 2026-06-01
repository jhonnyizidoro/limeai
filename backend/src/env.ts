import { z } from "zod";

const envSchema = z.object({
  isProd: z.boolean(),
  openAiKey: z.string(),
  db: z.object({
    user: z.string(),
    password: z.string(),
    name: z.string(),
    port: z.string().default("5432"),
    host: z.string(),
  }),
});

export default envSchema.parse({
  isProd: process.env.NODE_ENV === "production",
  openAiKey: process.env.OPEN_AI_KEY,
  db: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
  },
});
