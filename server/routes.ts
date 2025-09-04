import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Transaction routes
  
  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Failed to get transactions:", error);
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Add transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.addTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Failed to add transaction:", error);
      res.status(400).json({ error: "Failed to add transaction" });
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

  const httpServer = createServer(app);
  return httpServer;
}
