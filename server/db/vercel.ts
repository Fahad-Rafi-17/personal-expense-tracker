import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Load environment variables (for local development)
config();

// Simple Neon configuration for serverless
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });

export * from "./schema";
