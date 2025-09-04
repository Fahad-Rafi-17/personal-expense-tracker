import { pgTable, text, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  type: varchar("type", { length: 10 }).notNull(), // 'income' or 'expense'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").default(""),
  date: text("date").notNull(), // ISO date string
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
