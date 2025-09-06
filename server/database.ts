import { createClient } from '@supabase/supabase-js'

// For development, load dotenv
if (process.env.NODE_ENV !== 'production') {
  try {
    // Use require for dotenv in development
    const dotenv = require('dotenv')
    dotenv.config()
  } catch {
    // In production (Vercel), environment variables are already available
  }
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

// Table name
export const TRANSACTIONS_TABLE = 'transactions'
