import { Transaction, InsertTransaction } from "@shared/schema";
import { get, post, put, del, handleApiResponse } from "./api";

const API_BASE = "/api/transactions";

export class ApiTransactionStorage {
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const response = await get(API_BASE);
      return handleApiResponse<Transaction[]>(response);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      throw error;
    }
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    try {
      const response = await post(API_BASE, data);
      return handleApiResponse<Transaction>(response);
    } catch (error) {
      console.error("Failed to add transaction:", error);
      throw error;
    }
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    try {
      const response = await put(`${API_BASE}/${id}`, data);
      
      if (response.status === 404) return null;
      return handleApiResponse<Transaction>(response);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const response = await del(`${API_BASE}/${id}`);
      
      if (response.status === 404) return false;
      await handleApiResponse(response);
      return true;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw error;
    }
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    try {
      const response = await get(`${API_BASE}/type/${type}`);
      return handleApiResponse<Transaction[]>(response);
    } catch (error) {
      console.error("Failed to fetch transactions by type:", error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.filter(t => t.date >= startDate && t.date <= endDate);
    } catch (error) {
      console.error("Failed to fetch transactions by date range:", error);
      throw error;
    }
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.filter(t => t.category === category);
    } catch (error) {
      console.error("Failed to fetch transactions by category:", error);
      throw error;
    }
  }

  async downloadCSV(): Promise<void> {
    try {
      const response = await get(`${API_BASE}/download/csv`, {
        headers: {
          'Content-Type': 'text/csv'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      throw error;
    }
  }

  async getCSVContent(): Promise<string> {
    try {
      const response = await get(`${API_BASE}/csv`, {
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.text();
    } catch (error) {
      console.error("Failed to get CSV content:", error);
      throw error;
    }
  }

  async getCurrentBalance(): Promise<number> {
    try {
      const response = await get('/api/balance');
      const data = await handleApiResponse<{ balance: number }>(response);
      return data.balance;
    } catch (error) {
      console.error("Failed to get current balance:", error);
      throw error;
    }
  }
}

// Keep the old LocalTransactionStorage for backup/migration
export class LocalTransactionStorage {
  private getTransactions(): Transaction[] {
    try {
      const stored = localStorage.getItem("budgettracker_transactions");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem("budgettracker_transactions", JSON.stringify(transactions));
  }

  getAllTransactions(): Transaction[] {
    return this.getTransactions().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Add other methods for potential migration
  addTransaction(data: InsertTransaction): Transaction {
    const transaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const transactions = this.getTransactions();
    transactions.push(transaction);
    this.saveTransactions(transactions);
    
    return transaction;
  }

  clearLocalStorage(): void {
    localStorage.removeItem("budgettracker_transactions");
  }
}

// Use the API storage by default
export const transactionStorage = new ApiTransactionStorage();
export const localTransactionStorage = new LocalTransactionStorage();
