import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Loan, InsertLoan, LoanPayment, InsertLoanPayment } from "@shared/schema";
import { get, post, put, del, handleApiResponse } from "@/lib/api";

interface LoanContextType {
  loans: Loan[];
  loading: boolean;
  addLoan: (data: InsertLoan) => Promise<Loan>;
  updateLoan: (id: string, data: Partial<InsertLoan>) => Promise<Loan | null>;
  deleteLoan: (id: string) => Promise<boolean>;
  getLoansByType: (type: "given" | "taken") => Loan[];
  getLoansByStatus: (status: "active" | "completed" | "defaulted") => Loan[];
  getLoanPayments: (loanId: string) => Promise<LoanPayment[]>;
  addLoanPayment: (data: InsertLoanPayment) => Promise<LoanPayment>;
  deleteLoanPayment: (paymentId: string) => Promise<boolean>;
  getLoanSummary: () => Promise<{
    totalLoansGiven: number;
    totalLoansTaken: number;
    activeLoansGiven: number;
    activeLoansTaken: number;
    totalOutstanding: number;
    totalOwed: number;
  }>;
  refresh: () => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await get("/api/loans");
      const data = await handleApiResponse<Loan[]>(response);
      setLoans(data);
    } catch (error) {
      console.error("Failed to load loans:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const addLoan = useCallback(async (data: InsertLoan): Promise<Loan> => {
    try {
      const response = await post("/api/loans", data);
      const newLoan = await handleApiResponse<Loan>(response);
      setLoans(prev => [newLoan, ...prev]);
      return newLoan;
    } catch (error) {
      console.error("Failed to add loan:", error);
      throw error;
    }
  }, []);

  const updateLoan = useCallback(async (id: string, data: Partial<InsertLoan>): Promise<Loan | null> => {
    try {
      const response = await put(`/api/loans/${id}`, data);
      
      if (response.status === 404) return null;
      
      const updated = await handleApiResponse<Loan>(response);
      setLoans(prev => prev.map(loan => loan.id === id ? updated : loan));
      return updated;
    } catch (error) {
      console.error("Failed to update loan:", error);
      throw error;
    }
  }, []);

  const deleteLoan = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await del(`/api/loans/${id}`);
      
      if (response.status === 404) return false;
      
      await handleApiResponse(response);
      setLoans(prev => prev.filter(loan => loan.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete loan:", error);
      throw error;
    }
  }, []);

  const getLoansByType = useCallback((type: "given" | "taken") => {
    return loans.filter(loan => loan.type === type);
  }, [loans]);

  const getLoansByStatus = useCallback((status: "active" | "completed" | "defaulted") => {
    return loans.filter(loan => loan.status === status);
  }, [loans]);

  const getLoanPayments = useCallback(async (loanId: string): Promise<LoanPayment[]> => {
    try {
      const response = await get(`/api/loans/${loanId}/payments`);
      return await handleApiResponse<LoanPayment[]>(response);
    } catch (error) {
      console.error("Failed to get loan payments:", error);
      throw error;
    }
  }, []);

  const addLoanPayment = useCallback(async (data: InsertLoanPayment): Promise<LoanPayment> => {
    try {
      const response = await post(`/api/loans/${data.loanId}/payments`, data);
      const payment = await handleApiResponse<LoanPayment>(response);
      
      // Refresh loans to update remaining amounts
      await loadLoans();
      
      return payment;
    } catch (error) {
      console.error("Failed to add loan payment:", error);
      throw error;
    }
  }, [loadLoans]);

  const deleteLoanPayment = useCallback(async (paymentId: string): Promise<boolean> => {
    try {
      const response = await del(`/api/loans/payments/${paymentId}`);
      
      if (response.status === 404) return false;
      
      await handleApiResponse(response);
      
      // Refresh loans to update remaining amounts
      await loadLoans();
      
      return true;
    } catch (error) {
      console.error("Failed to delete loan payment:", error);
      throw error;
    }
  }, [loadLoans]);

  const getLoanSummary = useCallback(async () => {
    try {
      const response = await get("/api/loans/summary");
      return await handleApiResponse<{
        totalLoansGiven: number;
        totalLoansTaken: number;
        activeLoansGiven: number;
        activeLoansTaken: number;
        totalOutstanding: number;
        totalOwed: number;
      }>(response);
    } catch (error) {
      console.error("Failed to get loan summary:", error);
      throw error;
    }
  }, []);

  const value = {
    loans,
    loading,
    addLoan,
    updateLoan,
    deleteLoan,
    getLoansByType,
    getLoansByStatus,
    getLoanPayments,
    addLoanPayment,
    deleteLoanPayment,
    getLoanSummary,
    refresh: loadLoans,
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoans() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error("useLoans must be used within a LoanProvider");
  }
  return context;
}
