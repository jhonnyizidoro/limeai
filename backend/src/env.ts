import { z } from "zod";

const envSchema = z.object({
  isProd: z.boolean(),
  openAiKey: z.string(),
  storageType: z.enum(["s3", "local"]).default("s3"),
  uploadsUrl: z.string().default(""),
  aws: z.object({
    accessKey: z.string(),
    secretKey: z.string(),
    bucket: z.string(),
    region: z.string(),
  }),
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
  storageType: process.env.STORAGE_TYPE,
  uploadsUrl: process.env.UPLOADS_URL,
  db: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
  },
  aws: {
    // Makes required only when STORAGE_TYPE is not "local"
    accessKey: process.env.STORAGE_TYPE === "local" ? "placeholder" : process.env.AWS_ACCESS_KEY,
    secretKey: process.env.STORAGE_TYPE === "local" ? "placeholder" : process.env.AWS_SECRET_KEY,
    bucket: process.env.STORAGE_TYPE === "local" ? "placeholder" : process.env.AWS_BUCKET,
    region: process.env.STORAGE_TYPE === "local" ? "placeholder" : process.env.AWS_REGION,
  },
});
