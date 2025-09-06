import { type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";
import { postgresStorage } from "./postgres-storage";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getAllTransactions(): Promise<Transaction[]>;
  addTransaction(data: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null>;
  deleteTransaction(id: string): Promise<boolean>;
  getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
  
  // CSV methods
  getCSVContent(): Promise<string>;
  downloadCSV(): Promise<Buffer>;
  getCurrentBalance(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
    
    // Validate database configuration
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is not set!");
      console.error("Please configure your Neon PostgreSQL database URL in Vercel environment variables.");
      throw new Error("Database configuration missing: DATABASE_URL is required");
    }
    
    console.log("✅ Database storage initialized with PostgreSQL");
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods - use database only
  async getAllTransactions(): Promise<Transaction[]> {
    return await postgresStorage.getAllTransactions();
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    return await postgresStorage.addTransaction(data);
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    return await postgresStorage.updateTransaction(id, data);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return await postgresStorage.deleteTransaction(id);
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    return await postgresStorage.getTransactionsByType(type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return await postgresStorage.getTransactionsByDateRange(startDate, endDate);
  }

  // CSV methods
  async getCSVContent(): Promise<string> {
    return await postgresStorage.getCSVContent();
  }

  async downloadCSV(): Promise<Buffer> {
    return await postgresStorage.downloadCSV();
  }

  async getCurrentBalance(): Promise<number> {
    return await postgresStorage.getCurrentBalance();
  }
}

export const storage = new DatabaseStorage();
