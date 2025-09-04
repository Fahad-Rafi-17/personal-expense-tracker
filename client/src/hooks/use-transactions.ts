import { useState, useEffect, useCallback } from "react";
import { Transaction, InsertTransaction } from "@shared/schema";
import { transactionStorage } from "@/lib/storage";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await transactionStorage.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (data: InsertTransaction) => {
    try {
      const newTransaction = await transactionStorage.addTransaction(data);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (error) {
      console.error("Failed to add transaction:", error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<InsertTransaction>) => {
    try {
      const updated = await transactionStorage.updateTransaction(id, data);
      if (updated) {
        setTransactions(prev => 
          prev.map(t => t.id === id ? updated : t)
        );
      }
      return updated;
    } catch (error) {
      console.error("Failed to update transaction:", error);
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const success = await transactionStorage.deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      throw error;
    }
  }, []);

  // Computed values
  const totalBalance = transactions.reduce((sum, t) => 
    sum + (t.type === "income" ? t.amount : -t.amount), 0
  );

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    recentTransactions,
    monthlyTransactions,
    refresh: loadTransactions,
  };
}
