import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.error("Please configure your Neon PostgreSQL database URL in Vercel environment variables.");
  throw new Error("DATABASE_URL is not set. Please configure your Neon PostgreSQL database URL.");
}

// Create Neon HTTP client - better for serverless environments
const sql = neon(process.env.DATABASE_URL);

// Create drizzle instance with Neon
export const db = drizzle(sql);

// Initialize database - create tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database connection...");
    
    // Test the connection by running a simple query
    await sql`SELECT 1`;
    console.log("✅ Database connection successful");
    
    // Create transactions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        category TEXT NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;
    
    console.log("✅ Database tables initialized");
    
    // Check if we have any transactions
    const count = await sql`SELECT COUNT(*) as count FROM transactions`;
    console.log(`📊 Database contains ${count[0].count} transactions`);
    
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}
