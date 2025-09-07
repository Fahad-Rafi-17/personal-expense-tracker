# Personal Expense Tracker - Project Documentation

## 📖 Project Overview

The **Personal Expense Tracker** is a comprehensive web application built with modern technologies to help users manage their personal finances. It provides an intuitive interface for tracking income and expenses, visualizing financial data through charts, and exporting transaction data in various formats.

### 🚀 Key Features

- **Transaction Management**: Add, edit, delete, and view income/expense transactions
- **Real-time Analytics**: Interactive charts and financial insights
- **Export Functionality**: Generate CSV bank statements and export transaction data
- **Responsive Design**: Mobile-first design with cross-device compatibility
- **Database Integration**: Support for both PostgreSQL and Supabase
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Real-time Updates**: Using React Query for efficient data fetching

### 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL, Supabase
- **UI Framework**: Tailwind CSS, Radix UI
- **State Management**: React Query, Context API
- **Charts**: Chart.js, Recharts
- **Deployment**: Vercel
- **Validation**: Zod schemas

---

## 📁 File Structure & Documentation

### Root Configuration Files

#### `package.json`
Main project configuration file containing:
- **Project metadata**: Name, version, description
- **Dependencies**: All frontend and backend packages
- **Scripts**: Development, build, and deployment commands
- **Type**: Module type for ES6 support

#### `vite.config.ts`
Vite build tool configuration:
- React plugin setup
- Development server configuration
- Build optimization settings
- Path aliases for imports

#### `tailwind.config.ts`
Tailwind CSS configuration:
- Custom color schemes
- Typography settings
- Animation configurations
- Custom component classes

#### `tsconfig.json`
TypeScript compiler configuration:
- Compilation targets and modules
- Path mapping for clean imports
- Strict type checking rules
- JSX settings for React

#### `vercel.json`
Vercel deployment configuration:
- Build settings
- Serverless function configuration
- Routing rules
- Environment variable handling

#### `postcss.config.js`
PostCSS configuration for CSS processing:
- Tailwind CSS integration
- Autoprefixer for browser compatibility

#### `components.json`
Shadcn/ui component library configuration:
- Component paths and styling
- Tailwind configuration
- TypeScript settings

---

### API Layer (`/api`)

#### `api/index.ts`
Serverless API entry point for Vercel:
- Express app export for Vercel functions
- Route handling for production deployment
- Middleware configuration

---

### Client Application (`/client`)

#### `client/index.html`
Main HTML template:
- Meta tags for SEO and responsiveness
- Font Awesome integration for icons
- Root div for React app mounting

#### `client/public/`
Static assets directory:
- **`logo.png`**: Application logo
- **`manifest.json`**: PWA manifest for mobile installation

#### Core Application Files

#### `client/src/main.tsx`
Application entry point:
- React DOM rendering
- CSS imports
- Root component mounting

#### `client/src/App.tsx`
Main application component:
- Router configuration using Wouter
- Global providers setup (Query Client, Tooltip, Transaction Context)
- Layout structure with mobile navigation
- Toast notification system

#### `client/src/index.css`
Global styles:
- Tailwind CSS base styles
- Custom CSS variables
- Font configurations
- Animation definitions

---

### Components (`/client/src/components`)

#### Core Components

#### `stat-card.tsx`
Reusable statistics card component:
- Display financial metrics with icons
- Trend indicators with percentage changes
- Progress bar for goal tracking
- Responsive design with hover effects

#### `quick-add-form.tsx`
Fast transaction entry form:
- Income/expense type selection
- Amount input with validation
- Category dropdown with predefined options
- Date picker with default to today
- Form validation using React Hook Form

#### `recent-transactions.tsx`
Recent transactions display widget:
- Last 5 transactions preview
- Transaction type indicators
- Quick action buttons
- Link to full transactions page

#### `mobile-navigation.tsx`
Bottom navigation for mobile devices:
- Fixed bottom positioning
- Icon-based navigation
- Active state indicators
- Responsive hiding on desktop

#### `bank-statement.tsx`
CSV export functionality:
- Date range selection
- Transaction filtering
- CSV file generation
- Download trigger

#### Dialog Components

#### `edit-transaction-dialog.tsx`
Modal for editing existing transactions:
- Pre-populated form fields
- Validation and error handling
- Update confirmation
- Cancel functionality

#### `delete-transaction-dialog.tsx`
Confirmation dialog for transaction deletion:
- Warning message display
- Confirmation buttons
- Safe deletion process
- Cancel option

---

### Chart Components (`/client/src/components/charts`)

#### `weekly-chart.tsx`
Weekly spending visualization:
- 7-day spending trend
- Interactive chart using Chart.js
- Responsive design
- Data aggregation by day

#### `category-chart.tsx`
Expense breakdown by category:
- Pie chart visualization
- Category color coding
- Percentage calculations
- Interactive legend

---

### UI Components (`/client/src/components/ui`)

This directory contains reusable UI components built with Radix UI primitives:

- **`button.tsx`**: Various button styles and variants
- **`input.tsx`**: Form input fields with validation states
- **`card.tsx`**: Container components for content sections
- **`dialog.tsx`**: Modal dialogs and popover components
- **`form.tsx`**: Form wrapper components with validation
- **`select.tsx`**: Dropdown select components
- **`table.tsx`**: Data table components
- **`toast.tsx`**: Notification components
- **`calendar.tsx`**: Date picker components
- **`chart.tsx`**: Chart wrapper components

And many more UI primitives for building consistent interfaces.

---

### Contexts (`/client/src/contexts`)

#### `transaction-context.tsx`
Global state management for transactions:
- Transaction CRUD operations
- Financial calculations (balance, income, expenses)
- Data fetching and caching
- Error handling and loading states

---

### Hooks (`/client/src/hooks`)

#### `use-mobile.tsx`
Mobile device detection hook:
- Screen size monitoring
- Responsive behavior logic
- Breakpoint detection

#### `use-toast.ts`
Toast notification management:
- Success/error message display
- Automatic dismissal
- Queue management

#### `use-transactions.ts`
Transaction data management hook:
- API calls for CRUD operations
- Data transformation
- Caching strategies

---

### Library (`/client/src/lib`)

#### `queryClient.ts`
React Query configuration:
- Cache settings
- Default query options
- Error handling
- Retry logic

#### `storage.ts`
Client-side storage utilities:
- Local storage operations
- Data serialization
- Cache management

#### `utils.ts`
Utility functions:
- Class name merging (cn)
- Date formatting
- Number formatting
- Common helper functions

---

### Pages (`/client/src/pages`)

#### `dashboard.tsx`
Main dashboard page:
- Financial overview cards
- Quick add transaction form
- Recent transactions widget
- Charts and analytics preview

#### `analytics.tsx`
Detailed analytics page:
- Comprehensive charts and graphs
- Financial trends analysis
- Category breakdowns
- Period comparisons

#### `transactions.tsx`
Transaction management page:
- Complete transaction listing
- Search and filtering
- Sorting options
- Bulk operations

#### `bank-statement.tsx`
Bank statement generation page:
- Date range selection
- Export options
- CSV download functionality
- Transaction filtering

#### `not-found.tsx`
404 error page:
- User-friendly error message
- Navigation options
- Consistent styling

---

### Server (`/server`)

#### `server/index.ts`
Main server application:
- Express.js setup
- Middleware configuration
- Route registration
- CORS handling
- Development/production environment handling

#### `server/routes.ts`
API route definitions:
- Transaction CRUD endpoints
- Error handling middleware
- Request validation
- Response formatting

#### `server/vite.ts`
Development server configuration:
- Vite development middleware
- Static file serving
- Hot module replacement
- Build process integration

#### Storage Layer

#### `server/storage.ts`
Storage abstraction layer:
- Interface definitions
- Storage method selection
- Error handling

#### `server/postgres-storage.ts`
PostgreSQL database implementation:
- Connection management
- Query execution
- Transaction operations
- Error handling

#### `server/supabase-storage.ts`
Supabase database implementation:
- Supabase client setup
- Real-time subscriptions
- Authentication handling
- Query operations

#### Database (`/server/db`)

#### `server/db/index.ts`
Database connection and configuration:
- Connection string management
- Pool configuration
- Migration handling
- Table initialization

#### `server/database.ts`
Database schema and operations:
- Table definitions
- Query builders
- Data validation
- Relationship management

---

### Shared (`/shared`)

#### `shared/schema.ts`
Shared type definitions and validation schemas:
- **User schemas**: User data structure and validation
- **Transaction schemas**: Transaction data validation
- **Category definitions**: Predefined income/expense categories
- **Category labels**: Human-readable category names
- **Category icons**: Icon mappings for categories
- **Zod schemas**: Runtime validation rules

---

### Migrations (`/migrations`)

#### Database Migration Files

#### `migrations/0000_zippy_molten_man.sql`
Initial database schema:
- Users table creation
- Transactions table creation
- Indexes and constraints
- Initial data seeding

#### `migrations/meta/`
Migration metadata:
- **`_journal.json`**: Migration history tracking
- **`0000_snapshot.json`**: Database schema snapshots

---

### Additional Files

#### `migrate.ts`
Database migration runner:
- Migration execution
- Schema updates
- Data transformations

#### `setup-database.sh`
Database setup script:
- Environment configuration
- Database initialization
- Migration execution

#### `supabase-setup.sql`
Supabase-specific setup:
- Table creation
- Row Level Security policies
- Indexes and constraints

#### Documentation Files

#### `README.md`
Project overview and setup instructions

#### `DEPLOYMENT_GUIDE.md`
Comprehensive deployment guide:
- Database configuration
- Environment variables
- Vercel deployment steps
- Troubleshooting guide

#### `SUPABASE_SETUP.md`
Supabase integration guide:
- Project setup steps
- Database configuration
- Environment variable setup
- Security configuration

#### `replit.md`
Replit-specific development guide

#### `debug.html`
Development debugging utilities

---

## 🚀 Development Workflow

### Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Configure database credentials
   edit .env
   ```

3. **Database Setup**
   ```bash
   # Run database migrations
   npm run migrate
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

### Build Process

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm run deploy
   ```

### Code Structure

- **Frontend**: Modern React with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with Radix UI
- **State Management**: React Query + Context API

---

## 📊 Features in Detail

### Transaction Management
- Add income and expense transactions
- Edit existing transactions
- Delete transactions with confirmation
- Categorize transactions with predefined categories
- Add custom descriptions and dates

### Analytics & Insights
- Real-time balance calculation
- Monthly income and expense tracking
- Category-wise expense breakdown
- Weekly spending trends
- Savings goal tracking with progress indicators

### Export & Import
- Generate CSV bank statements
- Custom date range exports
- Transaction filtering before export
- Professional formatting for financial records

### User Experience
- Responsive design for all devices
- Mobile-first navigation
- Toast notifications for user feedback
- Loading states and error handling
- Intuitive form validation

---

## 🔧 Technical Architecture

### Frontend Architecture
- **Component-based**: Modular React components
- **Type-safe**: Full TypeScript implementation
- **Responsive**: Mobile-first design approach
- **State Management**: Context API with React Query
- **Styling**: Utility-first with Tailwind CSS

### Backend Architecture
- **RESTful API**: Express.js with TypeScript
- **Database Abstraction**: Multiple storage options
- **Error Handling**: Comprehensive error management
- **Validation**: Zod schema validation
- **Development**: Hot reload with Vite

### Database Design
- **Normalized Schema**: Efficient data structure
- **Indexes**: Optimized query performance
- **Constraints**: Data integrity enforcement
- **Migration System**: Version-controlled schema changes

---

## 🚀 Deployment Options

### Vercel (Recommended)
- Serverless functions for API
- Automatic builds from Git
- Environment variable management
- Edge caching and CDN

### Database Options
- **Neon**: Serverless PostgreSQL
- **Supabase**: Full-stack platform
- **Local PostgreSQL**: Development environment

---

This documentation provides a comprehensive overview of the Personal Expense Tracker project, its architecture, and how each component contributes to the overall functionality. The application is designed to be maintainable, scalable, and user-friendly while providing powerful financial tracking capabilities.
