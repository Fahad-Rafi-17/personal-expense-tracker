import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

// For Vercel Postgres - optimized for serverless
export const vercelDb = drizzle(sql, { schema });

// Fallback for other PostgreSQL providers
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/cashflow";

// Create postgres client with connection pooling
const client = postgres(connectionString, {
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  connect_timeout: 60,
});

export const postgresDb = drizzlePostgres(client, { schema });

// Auto-detect which database to use
export const db = process.env.VERCEL_ENV ? vercelDb : postgresDb;

export * from "./schema";
