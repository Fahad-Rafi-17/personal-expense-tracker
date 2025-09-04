import { type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";
import { hybridStorage } from "./hybrid-storage";

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

export class HybridDatabaseStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
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

  // Transaction methods - delegate to hybrid storage
  async getAllTransactions(): Promise<Transaction[]> {
    return hybridStorage.getAllTransactions();
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    return hybridStorage.addTransaction(data);
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    return hybridStorage.updateTransaction(id, data);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return hybridStorage.deleteTransaction(id);
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    return hybridStorage.getTransactionsByType(type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return hybridStorage.getTransactionsByDateRange(startDate, endDate);
  }

  // CSV methods
  async getCSVContent(): Promise<string> {
    return hybridStorage.getCSVContent();
  }

  async downloadCSV(): Promise<Buffer> {
    return hybridStorage.downloadCSV();
  }

  async getCurrentBalance(): Promise<number> {
    return hybridStorage.getCurrentBalance();
  }
}

export const storage = new HybridDatabaseStorage();
