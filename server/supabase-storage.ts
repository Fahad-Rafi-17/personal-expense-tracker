import { Transaction, InsertTransaction } from "@shared/schema";
import { supabase, TRANSACTIONS_TABLE, DatabaseTransaction } from "./database";
import { randomUUID } from "crypto";

export class SupabaseStorage {
  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToTransaction);
  }

  async addTransaction(data: InsertTransaction): Promise<Transaction> {
    const transaction: DatabaseTransaction = {
      id: randomUUID(),
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description || '',
      date: data.date,
      created_at: new Date().toISOString(),
    };

    const { data: insertedData, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw new Error(`Failed to add transaction: ${error.message}`);
    }

    return this.mapDatabaseToTransaction(insertedData);
  }

  async updateTransaction(id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    const { data: updatedData, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows updated
      }
      console.error('Error updating transaction:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return this.mapDatabaseToTransaction(updatedData);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }

    return true;
  }

  async getTransactionsByType(type: "income" | "expense"): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by type:', error);
      throw new Error(`Failed to fetch transactions by type: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToTransaction);
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from(TRANSACTIONS_TABLE)
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by date range:', error);
      throw new Error(`Failed to fetch transactions by date range: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToTransaction);
  }

  private mapDatabaseToTransaction(dbTransaction: DatabaseTransaction): Transaction {
    return {
      id: dbTransaction.id,
      type: dbTransaction.type,
      amount: dbTransaction.amount,
      category: dbTransaction.category,
      description: dbTransaction.description,
      date: dbTransaction.date,
      createdAt: dbTransaction.created_at,
    };
  }

  // CSV methods
  async getCSVContent(): Promise<string> {
    try {
      const transactions = await this.getAllTransactions();
      const headers = 'Date,Type,Amount,Category,Description\n';
      const rows = transactions.map(t => 
        `${t.date},${t.type},${t.amount},${t.category},"${(t.description || '').replace(/"/g, '""')}"`
      ).join('\n');
      
      return headers + rows;
    } catch (error) {
      console.error('Error generating CSV content:', error);
      throw new Error('Failed to generate CSV content');
    }
  }

  async downloadCSV(): Promise<Buffer> {
    try {
      const csvContent = await this.getCSVContent();
      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      console.error('Error creating CSV buffer:', error);
      throw new Error('Failed to create CSV download');
    }
  }

  async getCurrentBalance(): Promise<number> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.reduce((balance, transaction) => {
        return transaction.type === 'income' 
          ? balance + transaction.amount 
          : balance - transaction.amount;
      }, 0);
    } catch (error) {
      console.error('Error calculating current balance:', error);
      throw new Error('Failed to calculate balance');
    }
  }
}
