# Cash Flow Tracker 💰

A personal expense tracking application with bank statement-style CSV export functionality.

## Features

✅ **Add/Edit/Delete Transactions**: Track income and expenses
✅ **Bank Statement View**: View transactions in bank statement format with running balance
✅ **CSV Export**: Download your transactions as a CSV file (bank statement format)
✅ **Analytics Dashboard**: View charts and spending analytics
✅ **Cross-device Access**: Access from phone, tablet, or computer
✅ **Offline-first**: Works offline with automatic sync

## CSV Format

The exported CSV follows standard bank statement format:
```
Date,Description,Withdrawals,Deposits,Balance
01/15/2025,"Salary",,"2500.00","2500.00"
01/16/2025,"Groceries","85.50",,"2414.50"
01/17/2025,"Gas","45.00",,"2369.50"
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Local: `http://localhost:5000`
   - Network: `http://YOUR_IP:5000` (for phone/tablet access)

## Deployment to Vercel

### Quick Deploy (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Set up Vercel KV (for persistent storage):**
   - Go to your project in Vercel dashboard
   - Navigate to Storage tab
   - Create a new KV database
   - The environment variables will be automatically added

### Manual Deploy

1. **Push to GitHub**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically

## Storage Options

### Local Development
- Uses in-memory storage
- Data persists while server is running
- Perfect for testing and development

### Production (Vercel)
- Uses Vercel KV for persistent storage
- Data syncs across all devices
- Automatic CSV generation and export

## Accessing from Phone/Tablet

### Local Network (Development)
1. Find your computer's IP address:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
2. Access `http://YOUR_IP:5000` from your phone

### Global Access (Production)
Deploy to Vercel and access your app from anywhere at your Vercel URL.

## CSV Export Features

- **Bank Statement Format**: Standard format with Date, Description, Withdrawals, Deposits, Balance
- **Running Balance**: Automatically calculated running balance
- **Sorted by Date**: Transactions sorted chronologically
- **Downloadable**: One-click CSV download
- **Real-time Updates**: CSV updated automatically with each transaction

## Quick Setup

### 1. Clone and Install
```bash
git clone <your-repo>
cd personal-expense-tracker
npm install
```

### 2. Database Setup
```bash
# Run the setup script to see your options
npm run db:setup

# Choose one of these options:
# Option 1: Vercel Postgres (Recommended for production)
# Option 2: Neon Database (Free alternative) 
# Option 3: Local PostgreSQL (For development)
```

### 3. Configure Database
```bash
# After setting up your database, update the DATABASE_URL
# Then push the schema to your database
npm run db:push
```

### 4. Development
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
# Make sure you've set up Vercel Postgres in your dashboard
npm run deploy
```

## Environment Variables

### For Production (Vercel)

Set up **Vercel Postgres** in your Vercel dashboard:
1. Go to your project → Storage
2. Create Database → Select "Postgres"
3. DATABASE_URL is automatically configured

```env
DATABASE_URL=your_postgres_connection_string  # Automatically set by Vercel
```

### For Development

```env
DATABASE_URL=postgresql://localhost:5432/cashflow
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Vercel Postgres / Neon / Local)
- **ORM**: Drizzle ORM
- **Deployment**: Vercel
- **Charts**: Chart.js
- **Styling**: Tailwind CSS + shadcn/ui

## Project Structure

```
├── client/           # React frontend
├── server/           # Express backend
│   ├── db/          # Database schema and config
│   └── postgres-storage.ts  # Database operations
├── shared/           # Shared types and schemas
├── migrations/       # Database migrations
└── vercel.json       # Vercel deployment config
```

## Contributing

This is a personal expense tracker designed for individual use. Feel free to fork and customize for your needs!

## License

MIT License - feel free to use this for your personal expense tracking needs.
