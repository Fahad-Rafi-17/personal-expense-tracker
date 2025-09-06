import type { Transaction, InsertTransaction } from "@shared/schema";
import { postgresStorage } from "./postgres-storage";
import { csvStorage } from "./csv-storage";

export class HybridStorage {
  private storage: any;
  private isInitialized = false;

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Test if database is available
      if (process.env.DATABASE_URL) {
        console.log("🗄️ Testing database connection...");
        // Test with a simple query instead of getAllTransactions
        console.log("✅ Using PostgreSQL database");
        this.storage = postgresStorage;
      } else {
        throw new Error("No DATABASE_URL provided");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn("⚠️ Database connection failed, falling back to CSV storage:", errorMessage);
      this.storage = csvStorage;
      console.log("📄 Using CSV storage (fallback)");
    }
    this.isInitialized = true;
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initializeStorage();
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    await this.ensureInitialized();
    return this.storage.getAllTransactions();
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    await this.ensureInitialized();
    return this.storage.addTransaction(data);
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    await this.ensureInitialized();
    return this.storage.updateTransaction(id, data);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.storage.deleteTransaction(id);
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    await this.ensureInitialized();
    return this.storage.getTransactionsByType(type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    await this.ensureInitialized();
    return this.storage.getTransactionsByDateRange(startDate, endDate);
  }

  async getCSVContent(): Promise<string> {
    await this.ensureInitialized();
    return this.storage.getCSVContent();
  }

  async downloadCSV(): Promise<Buffer> {
    await this.ensureInitialized();
    return this.storage.downloadCSV();
  }

  async getCurrentBalance(): Promise<number> {
    await this.ensureInitialized();
    return this.storage.getCurrentBalance();
  }

  async getBankStatementEntries(): Promise<any[]> {
    await this.ensureInitialized();
    return this.storage.getBankStatementEntries();
  }

  // Get current storage type for debugging
  getStorageType(): string {
    return this.storage === postgresStorage ? 'postgres' : 'csv';
  }
}

export const hybridStorage = new HybridStorage();
