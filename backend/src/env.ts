import { z } from "zod";

const envSchema = z.object({
  db: z.object({
    user: z.string(),
    password: z.string(),
    name: z.string(),
    port: z.string().default("5432"),
    host: z.string(),
  }),
});

export default envSchema.parse({
  db: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
  },
});
