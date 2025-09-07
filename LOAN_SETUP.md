# Loan Tracking Setup Guide

## 🏦 Database Tables Setup

You need to create the loan tables in your Supabase database. Follow these steps:

### 1. Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `personal-expense-tracker`
4. Go to **SQL Editor** from the left sidebar

### 2. Create Loan Tables
Copy and paste the following SQL commands in the SQL Editor:

```sql
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
```

### 3. Set Row Level Security (RLS)
After creating the tables, you need to enable RLS:

```sql
-- Enable Row Level Security
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on loans" ON loans
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on loan_payments" ON loan_payments
FOR ALL USING (true) WITH CHECK (true);
```

### 4. Verify Tables
Run this query to verify the tables were created successfully:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('loans', 'loan_payments')
ORDER BY table_name, ordinal_position;
```

## 🚀 Deploy and Test

After setting up the tables:

1. **Push the changes to Vercel:**
   ```bash
   git push origin main
   ```

2. **Wait for deployment** (2-3 minutes)

3. **Test the loan functionality:**
   - Go to your deployed app
   - Navigate to the "Loans" tab in the bottom navigation
   - Try adding a test loan (money lent or borrowed)
   - Verify the loan appears in the appropriate tab

## 📊 Features Available

### ✅ **Loan Management**
- **Add loans** - Track money you've lent or borrowed
- **Loan types** - "Given" (money lent) vs "Taken" (money borrowed)
- **Loan details** - Person name, contact, amount, interest rate, due date
- **Status tracking** - Active, Completed, Defaulted

### ✅ **Payment Tracking**
- **Record payments** - Track payments made or received
- **Payment types** - Principal payments vs interest payments
- **Automatic updates** - Remaining amount updates automatically
- **Status updates** - Loan marked as completed when fully paid

### ✅ **Dashboard Integration**
- **Summary cards** - Total outstanding, total owed, etc.
- **Quick overview** - See all loan information at a glance
- **Organized tabs** - Separate views for money lent vs borrowed

### ✅ **Mobile-Friendly**
- **Responsive design** - Works perfectly on mobile devices
- **Mobile navigation** - Loans tab in bottom navigation
- **Touch-friendly** - Easy to use on phones and tablets

## 🎯 Next Steps

After the basic setup works:

1. **Add sample data** to test all features
2. **Create loan payments** to test the payment tracking
3. **Verify dashboard summaries** are calculating correctly
4. **Test mobile interface** on your phone

## 🔧 Troubleshooting

If you encounter issues:

1. **Check Vercel logs** for any API errors
2. **Verify Supabase tables** exist and have correct structure
3. **Test API endpoints** directly:
   - `GET /api/loans` - Should return empty array initially
   - `POST /api/loans` - Should create a new loan
   - `GET /api/loans/summary` - Should return summary stats

Your loan tracking system is now ready! 🎉
