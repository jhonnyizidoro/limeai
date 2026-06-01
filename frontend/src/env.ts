import { z } from "zod";

const envSchema = z.object({
  apiUrl: z.url(),
});

export default envSchema.parse({
  apiUrl: import.meta.env.VITE_API_URL,
});
