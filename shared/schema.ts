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

// Loan schemas
export const loanSchema = z.object({
  id: z.string(),
  type: z.enum(["given", "taken"]), // "given" = you lent money, "taken" = you borrowed money
  amount: z.number().positive(),
  remainingAmount: z.number().min(0),
  personName: z.string().min(1), // Name of the person you lent to or borrowed from
  personContact: z.string().optional().default(""), // Phone/email contact
  description: z.string().optional().default(""),
  interestRate: z.number().min(0).default(0), // Annual interest rate percentage
  dueDate: z.string().optional(), // ISO date string
  status: z.enum(["active", "completed", "defaulted"]).default("active"),
  createdAt: z.string().or(z.date()),
  completedAt: z.string().optional(),
});

export const insertLoanSchema = loanSchema.omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type Loan = z.infer<typeof loanSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

// Loan Payment schemas
export const loanPaymentSchema = z.object({
  id: z.string(),
  loanId: z.string(),
  amount: z.number().positive(),
  type: z.enum(["payment", "interest"]), // payment = principal payment, interest = interest payment
  description: z.string().optional().default(""),
  paymentDate: z.string(), // ISO date string
  createdAt: z.string().or(z.date()),
});

export const insertLoanPaymentSchema = loanPaymentSchema.omit({
  id: true,
  createdAt: true,
});

export type LoanPayment = z.infer<typeof loanPaymentSchema>;
export type InsertLoanPayment = z.infer<typeof insertLoanPaymentSchema>;

// Predefined categories
export const CATEGORIES = {
  INCOME: ["salary", "freelance", "investment", "business", "loan-repayment", "other-income"],
  EXPENSE: ["food", "transport", "shopping", "bills", "entertainment", "health", "loan-payment", "other-expense"]
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
  "loan-repayment": "Loan Repayment",
  "loan-payment": "Loan Payment",
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
  "loan-repayment": "fas fa-hand-holding-usd",
  "loan-payment": "fas fa-credit-card",
  "other-income": "fas fa-question-circle",
  "other-expense": "fas fa-question-circle"
} as const;

// Loan constants
export const LOAN_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DEFAULTED: "defaulted"
} as const;

export const LOAN_STATUS_LABELS = {
  active: "Active",
  completed: "Completed", 
  defaulted: "Defaulted"
} as const;

export const LOAN_STATUS_COLORS = {
  active: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  defaulted: "bg-red-100 text-red-800"
} as const;
