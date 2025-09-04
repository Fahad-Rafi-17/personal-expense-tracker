import type { Express } from "express";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        databasePrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "none",
        storageType: "postgres",
        isVercel: !!process.env.VERCEL_ENV
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
      console.log("Received transaction data:", req.body);
      const validatedData = insertTransactionSchema.parse(req.body);
      console.log("Validated transaction data:", validatedData);
      const transaction = await storage.addTransaction(validatedData);
      console.log("Added transaction:", transaction);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Failed to add transaction:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ error: "Failed to add transaction", details: error instanceof Error ? error.message : "Unknown error" });
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
}
