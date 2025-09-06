import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("🔄 Running database migrations...");
  
  try {
    // Create a migration client
    const migrationClient = postgres(connectionString, { max: 1 });
    const db = drizzle(migrationClient);
    
    // Run migrations
    await migrate(db, { migrationsFolder: "./migrations" });
    
    console.log("✅ Migrations completed successfully!");
    
    // Close the connection
    await migrationClient.end();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
