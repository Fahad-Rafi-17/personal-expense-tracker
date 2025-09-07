-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('given', 'taken')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  remaining_amount NUMERIC(10,2) NOT NULL CHECK (remaining_amount >= 0),
  person_name TEXT NOT NULL,
  person_contact TEXT DEFAULT '',
  description TEXT DEFAULT '',
  interest_rate NUMERIC(5,2) DEFAULT 0 CHECK (interest_rate >= 0),
  due_date TEXT, -- ISO date string
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  created_at TEXT NOT NULL,
  completed_at TEXT
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('payment', 'interest')),
  description TEXT DEFAULT '',
  payment_date TEXT NOT NULL, -- ISO date string
  created_at TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(type);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_payment_date ON loan_payments(payment_date);

-- Insert some sample data (optional - can be removed in production)
-- INSERT INTO loans (id, type, amount, remaining_amount, person_name, person_contact, description, interest_rate, due_date, status, created_at)
-- VALUES 
--   ('loan-1', 'given', 5000.00, 3000.00, 'John Doe', '+1234567890', 'Business loan for startup', 5.0, '2025-12-01', 'active', '2025-01-15T10:00:00Z'),
--   ('loan-2', 'taken', 10000.00, 8000.00, 'ABC Bank', 'loan@abcbank.com', 'Home renovation loan', 3.5, '2026-01-15', 'active', '2025-02-01T14:30:00Z');

-- INSERT INTO loan_payments (id, loan_id, amount, type, description, payment_date, created_at)
-- VALUES 
--   ('payment-1', 'loan-1', 2000.00, 'payment', 'First installment received', '2025-03-01', '2025-03-01T09:00:00Z'),
--   ('payment-2', 'loan-2', 2000.00, 'payment', 'Monthly EMI payment', '2025-03-05', '2025-03-05T15:00:00Z');
