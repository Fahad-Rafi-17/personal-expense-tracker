#!/bin/bash

# Deploy script for Personal Expense Tracker with Device Access Control
# This script builds and deploys the application to Vercel

echo "🚀 Deploying Personal Expense Tracker with Device Access Control..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the build errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔒 Your Personal Expense Tracker is now protected with device-based access control!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your deployed site to test the authentication"
    echo "2. Enter your master password to register your first device"
    echo "3. Check the Settings page to manage your devices"
    echo ""
    echo "📖 For setup instructions, see: DEVICE_ACCESS_SETUP.md"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
