import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerido"),
});

const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});

export const sql = neon(env.DATABASE_URL);
