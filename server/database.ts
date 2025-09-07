import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  config()
}

// Supabase configuration with debugging
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('🔍 Environment check:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('SUPABASE_URL exists:', !!supabaseUrl)
console.log('SUPABASE_ANON_KEY exists:', !!supabaseKey)

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL environment variable is missing!')
  console.error('Available SUPABASE env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
  throw new Error('SUPABASE_URL environment variable is required')
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY environment variable is missing!')
  console.error('Available SUPABASE env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))
  throw new Error('SUPABASE_ANON_KEY environment variable is required')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface DatabaseTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  created_at: string
}

export interface DatabaseLoan {
  id: string
  type: 'given' | 'taken'
  amount: number
  remaining_amount: number
  person_name: string
  person_contact: string
  description: string
  interest_rate: number
  due_date: string | null
  status: 'active' | 'completed' | 'defaulted'
  created_at: string
  completed_at: string | null
}

export interface DatabaseLoanPayment {
  id: string
  loan_id: string
  amount: number
  type: 'payment' | 'interest'
  description: string
  payment_date: string
  created_at: string
}

// Table names
export const TRANSACTIONS_TABLE = 'transactions'
export const LOANS_TABLE = 'loans'
export const LOAN_PAYMENTS_TABLE = 'loan_payments'
