# Deployment Guide - Personal Expense Tracker

## Database Configuration for Vercel

Your application is now configured to use **PostgreSQL database only** (no CSV fallbacks). Follow these steps to set up your Neon database on Vercel:

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or use an existing one
3. Copy your database connection string (it looks like: `postgresql://username:password@host/database?sslmode=require`)

### 2. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon database connection string
   - **Environment**: Production, Preview, and Development (select all)

### 3. Deploy to Vercel

```bash
# Build and deploy
npm run deploy
```

### 4. Verify Database Connection

After deployment, check your Vercel function logs:
- ✅ You should see: "Database connection successful"
- ✅ You should see: "Database tables initialized"
- ❌ If you see database errors, double-check your DATABASE_URL

## What's Been Updated

### Database-Only Storage
- **Removed**: CSV fallback storage
- **Added**: Proper error messages when DATABASE_URL is missing
- **Updated**: All storage operations now use PostgreSQL exclusively

### Database Configuration
- **Changed**: From `postgres-js` to `@neondatabase/serverless` (better for Vercel)
- **Added**: Automatic table creation on startup
- **Added**: Database initialization with error handling

### Error Handling
- **Improved**: Clear error messages for database connection issues
- **Added**: Database initialization checks before operations
- **Enhanced**: Better logging for debugging

## Key Files Updated

1. **`server/storage.ts`** - Removed CSV fallbacks, database-only storage
2. **`server/db/index.ts`** - Updated to use Neon serverless, added initialization
3. **`server/postgres-storage.ts`** - Added database initialization, better error handling

## Troubleshooting

### 500 Server Errors
- **Cause**: Missing or invalid DATABASE_URL
- **Solution**: Verify your Neon connection string in Vercel environment variables

### Database Connection Errors
- **Cause**: Incorrect Neon database URL format
- **Solution**: Ensure your URL includes `?sslmode=require` parameter

### Table Not Found Errors
- **Cause**: Database tables not created
- **Solution**: The app automatically creates tables on startup. Check logs for initialization errors.

## Sample Environment Variables

```bash
# Add this to your Vercel environment variables
DATABASE_URL=postgresql://username:password@your-neon-host/database?sslmode=require
```

## Features Working

✅ **Add Transactions**: Create new income/expense entries
✅ **Edit Transactions**: Modify existing transactions with confirmation
✅ **Delete Transactions**: Remove transactions with confirmation dialog
✅ **View Transactions**: List all transactions with filtering
✅ **Analytics**: Charts and balance calculations
✅ **Bank Statement**: CSV export functionality
✅ **Database Storage**: All data stored in PostgreSQL only

## Next Steps

1. Set up your DATABASE_URL in Vercel
2. Deploy the application
3. Test all features work with the database
4. Monitor Vercel function logs for any issues

Your expense tracker is now ready for production with proper database storage! 🎉
