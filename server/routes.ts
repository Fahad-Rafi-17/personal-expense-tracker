import type { Express } from "express";
import path from "path";
import { storage } from "./storage.js";
import { loanStorage } from "./loan-storage.js";
import { insertTransactionSchema, insertLoanSchema, insertLoanPaymentSchema } from "../shared/schema.js";

export async function registerRoutes(app: Express): Promise<void> {
  // Debug page for API testing
  app.get("/debug", (req, res) => {
    const debugHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>API Debug - Personal Expense Tracker</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            button { margin: 5px; padding: 10px; }
            .result { margin-top: 10px; padding: 10px; background: #f5f5f5; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <h1>API Debug - Personal Expense Tracker</h1>
        
        <div class="test-section">
            <h3>Health Check</h3>
            <button onclick="testHealthCheck()">Test Health Check</button>
            <div id="health-result" class="result"></div>
        </div>
        
        <div class="test-section">
            <h3>Get Transactions</h3>
            <button onclick="getTransactions()">Get All Transactions</button>
            <div id="transactions-result" class="result"></div>
        </div>
        
        <div class="test-section">
            <h3>Add Transaction</h3>
            <button onclick="addTestTransaction()">Add Test Transaction</button>
            <div id="add-result" class="result"></div>
        </div>

        <script>
            async function testHealthCheck() {
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    document.getElementById('health-result').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    document.getElementById('health-result').textContent = 'Error: ' + error.message;
                }
            }

            async function getTransactions() {
                try {
                    const response = await fetch('/api/transactions');
                    const data = await response.json();
                    document.getElementById('transactions-result').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    document.getElementById('transactions-result').textContent = 'Error: ' + error.message;
                }
            }

            async function addTestTransaction() {
                try {
                    const testTransaction = {
                        type: 'expense',
                        amount: 25.99,
                        category: 'Test',
                        description: 'Debug test transaction',
                        date: '2025-09-06'
                    };

                    const response = await fetch('/api/transactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(testTransaction)
                    });

                    const data = await response.json();
                    document.getElementById('add-result').textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    document.getElementById('add-result').textContent = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(debugHtml);
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
        supabaseUrlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + "..." : "missing",
        storageType: "supabase",
        isVercel: !!process.env.VERCEL_ENV,
        availableSupabaseVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Transaction routes
  
  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      console.log("Getting all transactions...");
      const transactions = await storage.getAllTransactions();
      console.log("Retrieved transactions count:", transactions.length);
      res.json(transactions);
    } catch (error) {
      console.error("Failed to get transactions:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ error: "Failed to get transactions", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Add transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      console.log("=== ADD TRANSACTION DEBUG ===");
      console.log("Environment:", process.env.NODE_ENV);
      console.log("Vercel ENV:", process.env.VERCEL_ENV);
      console.log("Has SUPABASE_URL:", !!process.env.SUPABASE_URL);
      console.log("Has SUPABASE_ANON_KEY:", !!process.env.SUPABASE_ANON_KEY);
      console.log("Request body:", req.body);
      
      // Validate the data
      const validatedData = insertTransactionSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Add the transaction
      console.log("Adding transaction to storage...");
      const transaction = await storage.addTransaction(validatedData);
      console.log("Successfully added transaction:", transaction);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("=== ADD TRANSACTION ERROR ===");
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      // More specific error responses
      if (error instanceof Error) {
        if (error.message.includes('SUPABASE_URL')) {
          return res.status(500).json({ 
            error: "Database configuration error", 
            details: "Supabase URL not configured",
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
        if (error.message.includes('validation')) {
          return res.status(400).json({ 
            error: "Invalid transaction data", 
            details: error.message 
          });
        }
      }
      
      res.status(500).json({ 
        error: "Failed to add transaction", 
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update transaction
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      res.status(400).json({ error: "Failed to update transaction" });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTransaction(id);
      
      if (!success) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Get transactions by type
  app.get("/api/transactions/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== "income" && type !== "expense") {
        return res.status(400).json({ error: "Invalid transaction type" });
      }
      
      const transactions = await storage.getTransactionsByType(type);
      res.json(transactions);
    } catch (error) {
      console.error("Failed to get transactions by type:", error);
      res.status(500).json({ error: "Failed to get transactions by type" });
    }
  });

  // Download CSV file
  app.get("/api/transactions/download/csv", async (req, res) => {
    try {
      const csvBuffer = await storage.downloadCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      res.send(csvBuffer);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      res.status(500).json({ error: "Failed to download CSV" });
    }
  });

  // Get CSV content (for preview)
  app.get("/api/transactions/csv", async (req, res) => {
    try {
      const csvContent = await storage.getCSVContent();
      res.setHeader('Content-Type', 'text/plain');
      res.send(csvContent);
    } catch (error) {
      console.error("Failed to get CSV content:", error);
      res.status(500).json({ error: "Failed to get CSV content" });
    }
  });

  // Get current balance
  app.get("/api/balance", async (req, res) => {
    try {
      const balance = await storage.getCurrentBalance();
      res.json({ balance });
    } catch (error) {
      console.error("Failed to get balance:", error);
      res.status(500).json({ error: "Failed to get balance" });
    }
  });

  // ============== LOAN ROUTES ==============

  // Get all loans
  app.get("/api/loans", async (req, res) => {
    try {
      console.log("Getting all loans...");
      const loans = await loanStorage.getAllLoans();
      console.log("Retrieved loans count:", loans.length);
      res.json(loans);
    } catch (error) {
      console.error("Failed to get loans:", error);
      res.status(500).json({ 
        error: "Failed to get loans", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Add loan
  app.post("/api/loans", async (req, res) => {
    try {
      console.log("=== ADD LOAN DEBUG ===");
      console.log("Request body:", req.body);
      
      const validatedData = insertLoanSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      const loan = await loanStorage.addLoan(validatedData);
      console.log("Successfully added loan:", loan);
      
      res.status(201).json(loan);
    } catch (error) {
      console.error("=== ADD LOAN ERROR ===");
      console.error("Error:", error);
      
      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({ 
          error: "Invalid loan data", 
          details: error.message 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to add loan", 
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update loan
  app.put("/api/loans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLoanSchema.partial().parse(req.body);
      const loan = await loanStorage.updateLoan(id, validatedData);
      
      if (!loan) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.json(loan);
    } catch (error) {
      console.error("Failed to update loan:", error);
      res.status(400).json({ error: "Failed to update loan" });
    }
  });

  // Delete loan
  app.delete("/api/loans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await loanStorage.deleteLoan(id);
      
      if (!success) {
        return res.status(404).json({ error: "Loan not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete loan:", error);
      res.status(500).json({ error: "Failed to delete loan" });
    }
  });

  // Get loans by type
  app.get("/api/loans/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== "given" && type !== "taken") {
        return res.status(400).json({ error: "Invalid loan type" });
      }
      
      const loans = await loanStorage.getLoansByType(type);
      res.json(loans);
    } catch (error) {
      console.error("Failed to get loans by type:", error);
      res.status(500).json({ error: "Failed to get loans by type" });
    }
  });

  // Get loans by status
  app.get("/api/loans/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      if (status !== "active" && status !== "completed" && status !== "defaulted") {
        return res.status(400).json({ error: "Invalid loan status" });
      }
      
      const loans = await loanStorage.getLoansByStatus(status);
      res.json(loans);
    } catch (error) {
      console.error("Failed to get loans by status:", error);
      res.status(500).json({ error: "Failed to get loans by status" });
    }
  });

  // Get loan summary
  app.get("/api/loans/summary", async (req, res) => {
    try {
      const summary = await loanStorage.getLoanSummary();
      res.json(summary);
    } catch (error) {
      console.error("Failed to get loan summary:", error);
      res.status(500).json({ error: "Failed to get loan summary" });
    }
  });

  // ============== LOAN PAYMENT ROUTES ==============

  // Get payments for a specific loan
  app.get("/api/loans/:loanId/payments", async (req, res) => {
    try {
      const { loanId } = req.params;
      const payments = await loanStorage.getLoanPayments(loanId);
      res.json(payments);
    } catch (error) {
      console.error("Failed to get loan payments:", error);
      res.status(500).json({ error: "Failed to get loan payments" });
    }
  });

  // Add payment to a loan
  app.post("/api/loans/:loanId/payments", async (req, res) => {
    try {
      const { loanId } = req.params;
      const paymentData = { ...req.body, loanId };
      
      const validatedData = insertLoanPaymentSchema.parse(paymentData);
      const payment = await loanStorage.addLoanPayment(validatedData);
      
      res.status(201).json(payment);
    } catch (error) {
      console.error("Failed to add loan payment:", error);
      
      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({ 
          error: "Invalid payment data", 
          details: error.message 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to add loan payment", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete loan payment
  app.delete("/api/loans/payments/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const success = await loanStorage.deleteLoanPayment(paymentId);
      
      if (!success) {
        return res.status(404).json({ error: "Payment not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete loan payment:", error);
      res.status(500).json({ error: "Failed to delete loan payment" });
    }
  });
}
