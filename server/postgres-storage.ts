import { db, initializeDatabase, transactions } from "./db/index";
import type { Transaction, InsertTransaction } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface BankStatementEntry {
  date: string;
  description: string;
  withdrawals: string; // Amount for expenses
  deposits: string;    // Amount for income
  balance: string;     // Running balance
}

// Initialize database on module load
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw new Error("Database initialization failed. Please check your DATABASE_URL configuration.");
    }
  }
}

export class PostgresStorage {
  async getAllTransactions(): Promise<Transaction[]> {
    await ensureDbInitialized();
    try {
      const result = await db.select().from(transactions).orderBy(desc(transactions.date));
      return result.map(this.transformDbTransaction);
    } catch (error) {
      console.error("Failed to get all transactions:", error);
      throw new Error("Failed to retrieve transactions from database");
    }
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    await ensureDbInitialized();
    try {
      const transaction = {
        id: randomUUID(),
        ...data,
        amount: data.amount.toString(), // Convert to string for database
        date: data.date || new Date().toISOString().split('T')[0], // Use provided date or current date
        created_at: new Date().toISOString(),
      };

      const [result] = await db.insert(transactions).values(transaction).returning();
      return this.transformDbTransaction(result);
    } catch (error) {
      console.error("Failed to add transaction:", error);
      throw new Error("Failed to save transaction to database");
    }
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    await ensureDbInitialized();
    try {
      const updateData: any = { ...data };
      if (updateData.amount !== undefined) {
        updateData.amount = updateData.amount.toString();
      }

      const [result] = await db
        .update(transactions)
        .set(updateData)
        .where(eq(transactions.id, id))
        .returning();

      return result ? this.transformDbTransaction(result) : null;
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw new Error("Failed to update transaction in database");
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    await ensureDbInitialized();
    try {
      const [result] = await db
        .delete(transactions)
        .where(eq(transactions.id, id))
        .returning();

      return !!result;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw new Error("Failed to delete transaction from database");
    }
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    await ensureDbInitialized();
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(eq(transactions.type, type))
        .orderBy(desc(transactions.date));

      return result.map(this.transformDbTransaction);
    } catch (error) {
      console.error("Failed to get transactions by type:", error);
      throw new Error("Database query failed");
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    await ensureDbInitialized();
    try {
      const result = await db
        .select()
        .from(transactions)
        .where(
          and(
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));

      return result.map(this.transformDbTransaction);
    } catch (error) {
      console.error("Failed to get transactions by date range:", error);
      throw new Error("Database query failed");
    }
  }

  async getCurrentBalance(): Promise<number> {
    await ensureDbInitialized();
    try {
      const allTransactions = await this.getAllTransactions();
      return allTransactions.reduce((balance, transaction) => {
        const amount = Number(transaction.amount);
        return balance + (transaction.type === "income" ? amount : -amount);
      }, 0);
    } catch (error) {
      console.error("Failed to calculate balance:", error);
      throw new Error("Failed to calculate balance");
    }
  }

  async getCSVContent(): Promise<string> {
    await ensureDbInitialized();
    try {
      const allTransactions = await this.getAllTransactions();
      const sortedTransactions = [...allTransactions].sort((a, b) => 
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

      return csvHeaders + csvRows;
    } catch (error) {
      console.error("Failed to generate CSV:", error);
      throw new Error("Failed to generate CSV");
    }
  }

  async downloadCSV(): Promise<Buffer> {
    const csvContent = await this.getCSVContent();
    return Buffer.from(csvContent, 'utf-8');
  }

  async getBankStatementEntries(): Promise<BankStatementEntry[]> {
    await ensureDbInitialized();
    try {
      const allTransactions = await this.getAllTransactions();
      const sortedTransactions = [...allTransactions].sort((a, b) => 
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
    } catch (error) {
      console.error("Failed to get bank statement entries:", error);
      throw new Error("Failed to generate bank statement");
    }
  }

  // Helper method to transform database records to our Transaction type
  private transformDbTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      type: dbTransaction.type as "income" | "expense",
      amount: Number(dbTransaction.amount),
      category: dbTransaction.category,
      description: dbTransaction.description || "",
      date: dbTransaction.date,
      createdAt: dbTransaction.created_at || dbTransaction.createdAt,
    };
  }
}

export const postgresStorage = new PostgresStorage();
