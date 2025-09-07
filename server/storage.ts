import { type User, type InsertUser, type Transaction, type InsertTransaction } from "../shared/schema.js";
import { randomUUID } from "crypto";
import { SupabaseStorage } from "./supabase-storage.js";

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
  private supabaseStorage: SupabaseStorage;

  constructor() {
    this.users = new Map();
    this.supabaseStorage = new SupabaseStorage();
    
    // Validate Supabase configuration
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("❌ Supabase environment variables are not set!");
      console.error("Please configure SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables.");
      throw new Error("Database configuration missing: Supabase credentials are required");
    }
    
    console.log("✅ Database storage initialized with Supabase");
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

  // Transaction methods - use Supabase storage
  async getAllTransactions(): Promise<Transaction[]> {
    return await this.supabaseStorage.getAllTransactions();
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    return await this.supabaseStorage.addTransaction(data);
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    return await this.supabaseStorage.updateTransaction(id, data);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return await this.supabaseStorage.deleteTransaction(id);
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    return await this.supabaseStorage.getTransactionsByType(type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return await this.supabaseStorage.getTransactionsByDateRange(startDate, endDate);
  }

  // CSV methods
  async getCSVContent(): Promise<string> {
    return await this.supabaseStorage.getCSVContent();
  }

  async downloadCSV(): Promise<Buffer> {
    return await this.supabaseStorage.downloadCSV();
  }

  async getCurrentBalance(): Promise<number> {
    return await this.supabaseStorage.getCurrentBalance();
  }
}

export const storage = new DatabaseStorage();
