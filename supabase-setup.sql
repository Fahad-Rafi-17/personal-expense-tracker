-- Create transactions table for Personal Expense Tracker
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security (recommended for production)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can customize this later)
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO transactions (type, amount, category, description, date) VALUES
  ('expense', 50.00, 'Food', 'Grocery shopping', '2025-09-01'),
  ('income', 1000.00, 'Salary', 'Monthly salary', '2025-09-01'),
  ('expense', 25.50, 'Transportation', 'Bus fare', '2025-09-02'),
  ('expense', 15.75, 'Food', 'Coffee and snacks', '2025-09-03');
