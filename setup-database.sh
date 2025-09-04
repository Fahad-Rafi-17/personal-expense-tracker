#!/bin/bash

echo "🗄️  Setting up Database for Personal Expense Tracker"
echo "=================================================="

echo ""
echo "📋 You have 3 options for database setup:"
echo ""
echo "1. 🟢 Vercel Postgres (Recommended for production)"
echo "   - Go to your Vercel dashboard"
echo "   - Navigate to your project → Storage"
echo "   - Click 'Create Database' → Select 'Postgres'"
echo "   - This automatically sets DATABASE_URL environment variable"
echo ""
echo "2. 🟡 Neon Database (Free alternative)"
echo "   - Visit: https://neon.tech"
echo "   - Create free account and database"
echo "   - Copy connection string to DATABASE_URL in your .env"
echo ""
echo "3. 🔵 Local PostgreSQL (For development)"
echo "   - Install PostgreSQL locally"
echo "   - Create database: createdb cashflow"
echo "   - Set DATABASE_URL=postgresql://localhost:5432/cashflow"
echo ""

if [ -f ".env" ]; then
    echo "📄 Current .env file exists"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
    else
        echo "❌ DATABASE_URL not found in .env"
        echo "DATABASE_URL=postgresql://localhost:5432/cashflow" >> .env
        echo "✅ Added placeholder DATABASE_URL to .env"
    fi
else
    echo "📄 Creating .env file..."
    echo "DATABASE_URL=postgresql://localhost:5432/cashflow" > .env
    echo "✅ Created .env with placeholder DATABASE_URL"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Set up your preferred database (option 1, 2, or 3 above)"
echo "2. Update DATABASE_URL in your .env file or Vercel environment"
echo "3. Run: npm run db:push"
echo "4. Deploy to Vercel!"

echo ""
echo "💡 For Vercel deployment:"
echo "   Your DATABASE_URL will be automatically set when you create Vercel Postgres"
echo "   No manual configuration needed!"
