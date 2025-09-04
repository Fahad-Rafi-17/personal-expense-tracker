import { Transaction, InsertTransaction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface BankStatementEntry {
  date: string;
  description: string;
  withdrawals: string; // Amount for expenses
  deposits: string;    // Amount for income
  balance: string;     // Running balance
}

// Fallback storage for development (when KV is not available)
class LocalCSVStorage {
  private transactions: Transaction[] = [];
  private csvContent: string = "Date,Description,Withdrawals,Deposits,Balance\n";

  private async saveToMemory(transactions: Transaction[]): Promise<void> {
    this.transactions = transactions;
    this.generateCSV(transactions);
  }

  private generateCSV(transactions: Transaction[]): void {
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const csvHeaders = "Date,Description,Withdrawals,Deposits,Balance\n";
    let runningBalance = 0;
    
    const csvRows = sortedTransactions.map(transaction => {
      const amount = Number(transaction.amount);
      const isIncome = transaction.type === "income";
      
      runningBalance += isIncome ? amount : -amount;
      
      const date = new Date(transaction.date).toLocaleDateString('en-US');
      const description = transaction.description || transaction.category;
      const withdrawals = isIncome ? "" : amount.toFixed(2);
      const deposits = isIncome ? amount.toFixed(2) : "";
      const balance = runningBalance.toFixed(2);
      
      return `${date},"${description}",${withdrawals},${deposits},${balance}`;
    }).join('\n');

    this.csvContent = csvHeaders + csvRows;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactions;
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const transactions = [...this.transactions, transaction];
    await this.saveToMemory(transactions);
    
    return transaction;
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const updated = { ...this.transactions[index], ...data };
    const transactions = [...this.transactions];
    transactions[index] = updated;
    await this.saveToMemory(transactions);
    
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const filtered = this.transactions.filter(t => t.id !== id);
    if (filtered.length === this.transactions.length) return false;
    
    await this.saveToMemory(filtered);
    return true;
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    return this.transactions.filter(t => t.type === type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    );
  }

  async getCSVContent(): Promise<string> {
    return this.csvContent;
  }

  async downloadCSV(): Promise<Buffer> {
    return Buffer.from(this.csvContent, 'utf-8');
  }

  async getCurrentBalance(): Promise<number> {
    return this.transactions.reduce((balance, transaction) => {
      const amount = Number(transaction.amount);
      return balance + (transaction.type === "income" ? amount : -amount);
    }, 0);
  }

  async getBankStatementEntries(): Promise<BankStatementEntry[]> {
    const sortedTransactions = [...this.transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    
    return sortedTransactions.map(transaction => {
      const amount = Number(transaction.amount);
      const isIncome = transaction.type === "income";
      
      runningBalance += isIncome ? amount : -amount;
      
      return {
        date: new Date(transaction.date).toLocaleDateString('en-US'),
        description: transaction.description || transaction.category,
        withdrawals: isIncome ? "" : amount.toFixed(2),
        deposits: isIncome ? amount.toFixed(2) : "",
        balance: runningBalance.toFixed(2)
      };
    });
  }
}

// Try to use Vercel KV, fallback to local storage
let kvAvailable = false;
let kvModule: any = null;
try {
  kvModule = require('@vercel/kv');
  kvAvailable = !!kvModule && !!process.env.KV_URL;
  console.log("KV availability check:", { kvAvailable, hasKvUrl: !!process.env.KV_URL });
} catch (error) {
  console.log("Vercel KV not available, using local storage for development");
}

export class CSVStorage {
  private storage: any;
  private fallbackStorage: LocalCSVStorage;

  constructor() {
    // Always initialize fallback storage
    this.fallbackStorage = new LocalCSVStorage();
    
    if (kvAvailable && process.env.KV_URL && kvModule) {
      // Use Vercel KV storage in production
      console.log("Using Vercel KV storage");
      try {
        this.storage = new VercelKVStorage(kvModule);
      } catch (error) {
        console.error("Failed to initialize Vercel KV, falling back to local storage:", error);
        this.storage = this.fallbackStorage;
      }
    } else {
      // Use local storage for development
      console.log("Using local memory storage for development");
      this.storage = this.fallbackStorage;
    }
  }

  private async executeWithFallback<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error("KV operation failed, using fallback storage:", error);
      // Switch to fallback if KV fails
      if (this.storage !== this.fallbackStorage) {
        this.storage = this.fallbackStorage;
      }
      return await operation();
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.executeWithFallback(() => this.storage.getAllTransactions());
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    return this.executeWithFallback(() => this.storage.addTransaction(data));
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    return this.executeWithFallback(() => this.storage.updateTransaction(id, data));
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.executeWithFallback(() => this.storage.deleteTransaction(id));
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    return this.executeWithFallback(() => this.storage.getTransactionsByType(type));
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.executeWithFallback(() => this.storage.getTransactionsByDateRange(startDate, endDate));
  }

  async getCSVContent(): Promise<string> {
    return this.executeWithFallback(() => this.storage.getCSVContent());
  }

  async downloadCSV(): Promise<Buffer> {
    return this.executeWithFallback(() => this.storage.downloadCSV());
  }

  async getCurrentBalance(): Promise<number> {
    return this.executeWithFallback(() => this.storage.getCurrentBalance());
  }

  async getBankStatementEntries(): Promise<BankStatementEntry[]> {
    return this.executeWithFallback(() => this.storage.getBankStatementEntries());
  }
}

// Original Vercel KV implementation
class VercelKVStorage {
  private kv: any;

  constructor(kvModule?: any) {
    if (kvModule) {
      this.kv = kvModule.kv;
    } else {
      try {
        const { kv } = require('@vercel/kv');
        this.kv = kv;
      } catch (error) {
        console.error("Failed to initialize KV:", error);
        throw new Error("KV module not available");
      }
    }
  }

  private async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await this.kv.get("transactions_data") as Transaction[] | null;
      return data || [];
    } catch (error) {
      console.error("Failed to get transactions from KV:", error);
      return [];
    }
  }

  private async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await this.kv.set("transactions_data", transactions);
      await this.generateCSV(transactions);
    } catch (error) {
      console.error("Failed to save transactions to KV:", error);
      throw error;
    }
  }

  private async generateCSV(transactions: Transaction[]): Promise<void> {
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const csvHeaders = "Date,Description,Withdrawals,Deposits,Balance\n";
    let runningBalance = 0;
    
    const csvRows = sortedTransactions.map(transaction => {
      const amount = Number(transaction.amount);
      const isIncome = transaction.type === "income";
      
      runningBalance += isIncome ? amount : -amount;
      
      const date = new Date(transaction.date).toLocaleDateString('en-US');
      const description = transaction.description || transaction.category;
      const withdrawals = isIncome ? "" : amount.toFixed(2);
      const deposits = isIncome ? amount.toFixed(2) : "";
      const balance = runningBalance.toFixed(2);
      
      return `${date},"${description}",${withdrawals},${deposits},${balance}`;
    }).join('\n');

    const csvContent = csvHeaders + csvRows;
    
    try {
      await this.kv.set("transactions_csv", csvContent);
    } catch (error) {
      console.error("Failed to save CSV to KV:", error);
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.getTransactions();
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const transactions = await this.getTransactions();
    transactions.push(transaction);
    await this.saveTransactions(transactions);
    
    return transaction;
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    transactions[index] = { ...transactions[index], ...data };
    await this.saveTransactions(transactions);
    
    return transactions[index];
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    
    if (filtered.length === transactions.length) return false;
    
    await this.saveTransactions(filtered);
    return true;
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(t => t.type === type);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    );
  }

  async getCSVContent(): Promise<string> {
    try {
      const csvContent = await this.kv.get("transactions_csv") as string | null;
      return csvContent || "Date,Description,Withdrawals,Deposits,Balance\n";
    } catch (error) {
      console.error("Failed to get CSV content:", error);
      return "Date,Description,Withdrawals,Deposits,Balance\n";
    }
  }

  async downloadCSV(): Promise<Buffer> {
    const csvContent = await this.getCSVContent();
    return Buffer.from(csvContent, 'utf-8');
  }

  async getCurrentBalance(): Promise<number> {
    const transactions = await this.getTransactions();
    return transactions.reduce((balance, transaction) => {
      const amount = Number(transaction.amount);
      return balance + (transaction.type === "income" ? amount : -amount);
    }, 0);
  }

  async getBankStatementEntries(): Promise<BankStatementEntry[]> {
    const transactions = await this.getTransactions();
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    
    return sortedTransactions.map(transaction => {
      const amount = Number(transaction.amount);
      const isIncome = transaction.type === "income";
      
      runningBalance += isIncome ? amount : -amount;
      
      return {
        date: new Date(transaction.date).toLocaleDateString('en-US'),
        description: transaction.description || transaction.category,
        withdrawals: isIncome ? "" : amount.toFixed(2),
        deposits: isIncome ? amount.toFixed(2) : "",
        balance: runningBalance.toFixed(2)
      };
    });
  }
}

export const csvStorage = new CSVStorage();
