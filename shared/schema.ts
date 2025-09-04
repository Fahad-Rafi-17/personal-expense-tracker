import { z } from "zod";

// User schemas
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(1),
  email: z.string().email().optional(),
  createdAt: z.string().or(z.date()),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Transaction schemas
export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional().default(""),
  date: z.string(), // ISO date string
  createdAt: z.string().or(z.date()), // ISO date string or Date
});

export const insertTransactionSchema = transactionSchema.omit({
  id: true,
  createdAt: true,
});

export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Predefined categories
export const CATEGORIES = {
  INCOME: ["salary", "freelance", "investment", "business", "other-income"],
  EXPENSE: ["food", "transport", "shopping", "bills", "entertainment", "health", "other-expense"]
} as const;

export const CATEGORY_LABELS = {
  food: "Food & Dining",
  transport: "Transportation", 
  shopping: "Shopping",
  bills: "Bills & Utilities",
  entertainment: "Entertainment",
  health: "Health & Fitness",
  salary: "Salary",
  freelance: "Freelance",
  investment: "Investment",
  business: "Business",
  "other-income": "Other Income",
  "other-expense": "Other Expense"
} as const;

export const CATEGORY_ICONS = {
  food: "fas fa-utensils",
  transport: "fas fa-gas-pump",
  shopping: "fas fa-shopping-cart", 
  bills: "fas fa-file-invoice-dollar",
  entertainment: "fas fa-film",
  health: "fas fa-heartbeat",
  salary: "fas fa-dollar-sign",
  freelance: "fas fa-laptop",
  investment: "fas fa-chart-line",
  business: "fas fa-briefcase",
  "other-income": "fas fa-question-circle",
  "other-expense": "fas fa-question-circle"
} as const;
