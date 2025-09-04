import { type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";
import { csvStorage } from "./csv-storage";

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

export class CSVBasedStorage implements IStorage {
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

  // Transaction methods - delegate to CSV storage
  async getAllTransactions(): Promise<Transaction[]> {
    return csvStorage.getAllTransactions();
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    return csvStorage.addTransaction(data);
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    return csvStorage.updateTransaction(id, data);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return csvStorage.deleteTransaction(id);
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    return csvStorage.getTransactionsByType(type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return csvStorage.getTransactionsByDateRange(startDate, endDate);
  }

  // CSV methods
  async getCSVContent(): Promise<string> {
    return csvStorage.getCSVContent();
  }

  async downloadCSV(): Promise<Buffer> {
    return csvStorage.downloadCSV();
  }

  async getCurrentBalance(): Promise<number> {
    return csvStorage.getCurrentBalance();
  }
}

export const storage = new CSVBasedStorage();
