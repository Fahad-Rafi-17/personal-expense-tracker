import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuthTable() {
  console.log('🏗️ Setting up authentication table...');
  
  try {
    // Create the device_tokens table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create tables for device-based authentication system
        CREATE TABLE IF NOT EXISTS device_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            token TEXT NOT NULL UNIQUE,
            device_id TEXT NOT NULL,
            device_name TEXT NOT NULL,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE
        );

        -- Create index for faster token lookups
        CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_device_tokens_device_id ON device_tokens(device_id);
        CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(is_active);
      `
    });

    if (error) {
      console.error('❌ Error creating table:', error);
      return false;
    }

    console.log('✅ Authentication table created successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error setting up authentication table:', error);
    return false;
  }
}

// Run the setup
setupAuthTable()
  .then(success => {
    if (success) {
      console.log('🎉 Database setup complete!');
      process.exit(0);
    } else {
      console.log('❌ Database setup failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
