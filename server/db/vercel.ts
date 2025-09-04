import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// For Vercel + Neon - optimized for serverless
const sql = neon(process.env.DATABASE_URL!);
export const neonDb = drizzle(sql, { schema });

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

// Auto-detect which database to use - prefer Neon for Vercel
export const db = process.env.DATABASE_URL?.includes('neon.tech') ? neonDb : 
                 process.env.VERCEL_ENV ? neonDb : postgresDb;

export * from "./schema";
