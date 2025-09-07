import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Transaction, InsertTransaction } from "@shared/schema";
import { transactionStorage } from "@/lib/storage";

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (data: InsertTransaction) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<InsertTransaction>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  previousMonthIncome: number;
  previousMonthExpenses: number;
  recentTransactions: Transaction[];
  monthlyTransactions: Transaction[];
  refresh: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
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

  const addTransaction = useCallback(async (data: InsertTransaction): Promise<Transaction> => {
    try {
      const newTransaction = await transactionStorage.addTransaction(data);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (error) {
      console.error("Failed to add transaction:", error);
      throw error;
    }
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<InsertTransaction>): Promise<Transaction | null> => {
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

  const deleteTransaction = useCallback(async (id: string): Promise<boolean> => {
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

  // Previous month calculations
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const previousMonthStr = previousMonth.toISOString().slice(0, 7); // YYYY-MM
  const previousMonthTransactions = transactions.filter(t => 
    t.date.startsWith(previousMonthStr)
  );

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthIncome = previousMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthExpenses = previousMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  const value = {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    previousMonthIncome,
    previousMonthExpenses,
    recentTransactions,
    monthlyTransactions,
    refresh: loadTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}