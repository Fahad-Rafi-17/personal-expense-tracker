import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not found - you'll need to set this up for production");
}

export default defineConfig({
  out: "./migrations",
  schema: "./server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/cashflow",
  },
});
