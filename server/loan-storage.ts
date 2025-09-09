import { Loan, InsertLoan, LoanPayment, InsertLoanPayment } from "../shared/schema.js";
import { supabase, LOANS_TABLE, LOAN_PAYMENTS_TABLE, DatabaseLoan, DatabaseLoanPayment } from "./database.js";
import { randomUUID } from "crypto";

export class LoanStorage {
  // Loan CRUD operations
  async getAllLoans(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from(LOANS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loans:', error);
      throw new Error(`Failed to fetch loans: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToLoan);
  }

  async addLoan(data: InsertLoan): Promise<Loan> {
    try {
      console.log("=== LOAN STORAGE ADD LOAN ===");
      console.log("Input data:", data);
      
      // Fix: For new loans, remainingAmount should default to the full amount if not properly set
      const remainingAmount = data.remainingAmount !== undefined && data.remainingAmount > 0 
        ? data.remainingAmount 
        : data.amount;
      
      console.log("Calculated remaining amount:", remainingAmount);
      
      const loan: DatabaseLoan = {
        id: randomUUID(),
        type: data.type,
        amount: data.amount,
        remaining_amount: remainingAmount,
        person_name: data.personName,
        person_contact: data.personContact || '',
        description: data.description || '',
        interest_rate: data.interestRate || 0,
        due_date: data.dueDate || null,
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        completed_at: null,
      };

      console.log("Loan to insert:", loan);

      const { data: insertedData, error } = await supabase
        .from(LOANS_TABLE)
        .insert(loan)
        .select()
        .single();

      console.log("Supabase response - data:", insertedData);
      console.log("Supabase response - error:", error);

      if (error) {
        console.error('Error adding loan:', error);
        throw new Error(`Failed to add loan: ${error.message}`);
      }

      const result = this.mapDatabaseToLoan(insertedData);
      console.log("Final mapped result:", result);
      return result;
    } catch (error) {
      console.error("Error in addLoan:", error);
      throw error;
    }
  }

  async updateLoan(id: string, data: Partial<InsertLoan>): Promise<Loan | null> {
    const updateData: any = {};
    
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.remainingAmount !== undefined) updateData.remaining_amount = data.remainingAmount;
    if (data.personName !== undefined) updateData.person_name = data.personName;
    if (data.personContact !== undefined) updateData.person_contact = data.personContact;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.interestRate !== undefined) updateData.interest_rate = data.interestRate;
    if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: updatedData, error } = await supabase
      .from(LOANS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows updated
      }
      console.error('Error updating loan:', error);
      throw new Error(`Failed to update loan: ${error.message}`);
    }

    return this.mapDatabaseToLoan(updatedData);
  }

  async deleteLoan(id: string): Promise<boolean> {
    // First delete all associated loan payments
    await this.deleteLoanPaymentsByLoanId(id);

    const { error } = await supabase
      .from(LOANS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting loan:', error);
      throw new Error(`Failed to delete loan: ${error.message}`);
    }

    return true;
  }

  async getLoansByType(type: "given" | "taken"): Promise<Loan[]> {
    const { data, error } = await supabase
      .from(LOANS_TABLE)
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loans by type:', error);
      throw new Error(`Failed to fetch loans by type: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToLoan);
  }

  async getLoansByStatus(status: "active" | "completed" | "defaulted"): Promise<Loan[]> {
    const { data, error } = await supabase
      .from(LOANS_TABLE)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching loans by status:', error);
      throw new Error(`Failed to fetch loans by status: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToLoan);
  }

  // Loan Payment CRUD operations
  async getLoanPayments(loanId: string): Promise<LoanPayment[]> {
    const { data, error } = await supabase
      .from(LOAN_PAYMENTS_TABLE)
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching loan payments:', error);
      throw new Error(`Failed to fetch loan payments: ${error.message}`);
    }

    return (data || []).map(this.mapDatabaseToLoanPayment);
  }

  async addLoanPayment(data: InsertLoanPayment): Promise<LoanPayment> {
    try {
      const payment: DatabaseLoanPayment = {
        id: randomUUID(),
        loan_id: data.loanId,
        amount: data.amount,
        type: data.type,
        description: data.description || '',
        payment_date: data.paymentDate,
        created_at: new Date().toISOString(),
      };

      const { data: insertedData, error } = await supabase
        .from(LOAN_PAYMENTS_TABLE)
        .insert(payment)
        .select()
        .single();

      if (error) {
        console.error('Error adding loan payment:', error);
        throw new Error(`Failed to add loan payment: ${error.message}`);
      }

      // Update the remaining amount on the loan if it's a payment (not interest)
      if (data.type === 'payment') {
        await this.updateLoanRemainingAmount(data.loanId, -data.amount);
      }

      return this.mapDatabaseToLoanPayment(insertedData);
    } catch (error) {
      console.error("Error in addLoanPayment:", error);
      throw error;
    }
  }

  async deleteLoanPayment(id: string): Promise<boolean> {
    // Get the payment data first to adjust loan remaining amount
    const { data: paymentData, error: fetchError } = await supabase
      .from(LOAN_PAYMENTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching loan payment for deletion:', fetchError);
      throw new Error(`Failed to fetch loan payment: ${fetchError.message}`);
    }

    const { error } = await supabase
      .from(LOAN_PAYMENTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting loan payment:', error);
      throw new Error(`Failed to delete loan payment: ${error.message}`);
    }

    // Reverse the remaining amount adjustment if it was a payment
    if (paymentData && paymentData.type === 'payment') {
      await this.updateLoanRemainingAmount(paymentData.loan_id, paymentData.amount);
    }

    return true;
  }

  private async deleteLoanPaymentsByLoanId(loanId: string): Promise<void> {
    const { error } = await supabase
      .from(LOAN_PAYMENTS_TABLE)
      .delete()
      .eq('loan_id', loanId);

    if (error) {
      console.error('Error deleting loan payments:', error);
      throw new Error(`Failed to delete loan payments: ${error.message}`);
    }
  }

  private async updateLoanRemainingAmount(loanId: string, amountChange: number): Promise<void> {
    // Get current loan data
    const { data: loanData, error: fetchError } = await supabase
      .from(LOANS_TABLE)
      .select('remaining_amount')
      .eq('id', loanId)
      .single();

    if (fetchError) {
      console.error('Error fetching loan for amount update:', fetchError);
      return;
    }

    const newRemainingAmount = Math.max(0, loanData.remaining_amount + amountChange);
    
    // Update the loan status if fully paid
    const updateData: any = { remaining_amount: newRemainingAmount };
    if (newRemainingAmount === 0) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    } else if (loanData.remaining_amount === 0 && newRemainingAmount > 0) {
      // Reactivate if was completed and now has remaining amount
      updateData.status = 'active';
      updateData.completed_at = null;
    }

    const { error } = await supabase
      .from(LOANS_TABLE)
      .update(updateData)
      .eq('id', loanId);

    if (error) {
      console.error('Error updating loan remaining amount:', error);
    }
  }

  // Summary methods
  async getLoanSummary(): Promise<{
    totalLoansGiven: number;
    totalLoansTaken: number;
    activeLoansGiven: number;
    activeLoansTaken: number;
    totalOutstanding: number;
    totalOwed: number;
  }> {
    const loans = await this.getAllLoans();
    
    const summary = {
      totalLoansGiven: 0,
      totalLoansTaken: 0,
      activeLoansGiven: 0,
      activeLoansTaken: 0,
      totalOutstanding: 0, // Money others owe you
      totalOwed: 0, // Money you owe others
    };

    loans.forEach(loan => {
      if (loan.type === 'given') {
        summary.totalLoansGiven += loan.amount;
        if (loan.status === 'active') {
          summary.activeLoansGiven += loan.remainingAmount;
          summary.totalOutstanding += loan.remainingAmount;
        }
      } else {
        summary.totalLoansTaken += loan.amount;
        if (loan.status === 'active') {
          summary.activeLoansTaken += loan.remainingAmount;
          summary.totalOwed += loan.remainingAmount;
        }
      }
    });

    return summary;
  }

  private mapDatabaseToLoan(dbLoan: DatabaseLoan): Loan {
    return {
      id: dbLoan.id,
      type: dbLoan.type,
      amount: dbLoan.amount,
      remainingAmount: dbLoan.remaining_amount,
      personName: dbLoan.person_name,
      personContact: dbLoan.person_contact,
      description: dbLoan.description,
      interestRate: dbLoan.interest_rate,
      dueDate: dbLoan.due_date || undefined,
      status: dbLoan.status,
      createdAt: dbLoan.created_at,
      completedAt: dbLoan.completed_at || undefined,
    };
  }

  private mapDatabaseToLoanPayment(dbPayment: DatabaseLoanPayment): LoanPayment {
    return {
      id: dbPayment.id,
      loanId: dbPayment.loan_id,
      amount: dbPayment.amount,
      type: dbPayment.type,
      description: dbPayment.description,
      paymentDate: dbPayment.payment_date,
      createdAt: dbPayment.created_at,
    };
  }
}

export const loanStorage = new LoanStorage();
