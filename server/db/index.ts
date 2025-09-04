import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create connection string - you'll need to set this up
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/cashflow";

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

export * from "./schema";
