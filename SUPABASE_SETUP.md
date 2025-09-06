# Supabase Setup Guide

This guide will help you set up Supabase for your Personal Expense Tracker application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/log in
2. Create a new project
3. Choose a project name and password
4. Wait for the project to be created (this may take a few minutes)

## 2. Create the Transactions Table

Once your project is ready, go to the SQL Editor in your Supabase dashboard and run this SQL:

```sql
-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better performance
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Enable Row Level Security (recommended for production)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can customize this later)
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true);
```

## 3. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this will be your `SUPABASE_URL`)
   - **anon/public key** (this will be your `SUPABASE_ANON_KEY`)

## 4. Configure Environment Variables

### For Local Development
Create a `.env` file in your project root with:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

### For Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key

## 5. Test the Connection

Run your application locally to test the connection:

```bash
npm run dev
```

Try adding a new transaction to verify everything is working correctly.

## 6. Deploy to Vercel

Once everything is working locally:

```bash
npm run build
```

Then deploy to Vercel. Make sure your environment variables are configured in the Vercel dashboard.

## Features Supported

Your expense tracker now supports:
- ✅ Add new transactions
- ✅ View all transactions
- ✅ Edit existing transactions
- ✅ Delete transactions with confirmation
- ✅ Filter by transaction type (income/expense)
- ✅ Filter by date range
- ✅ Export transactions to CSV
- ✅ Calculate current balance
- ✅ Analytics and charts

## Security Notes

- The current setup allows all operations on the transactions table
- For production use, consider implementing proper Row Level Security policies
- You may want to add user authentication and associate transactions with specific users

## Troubleshooting

1. **Build errors**: Make sure all environment variables are set
2. **Connection errors**: Verify your Supabase URL and API key
3. **Table not found**: Ensure you've run the SQL commands to create the table
4. **Permission errors**: Check your RLS policies in Supabase

Your application is now ready to use with Supabase! 🎉
