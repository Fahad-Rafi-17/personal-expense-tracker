# Overview

This is a personal budget tracking application built with a modern full-stack architecture. The application allows users to track their income and expenses, categorize transactions, and view analytics through charts and dashboards. It features a responsive design optimized for both desktop and mobile devices, with a clean and intuitive user interface built using shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript, using Vite as the build tool and development server. The application follows a component-based architecture with the following key decisions:

- **UI Framework**: Uses shadcn/ui components built on top of Radix UI primitives for accessible and consistent design
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **Routing**: Wouter for lightweight client-side routing with three main pages: Dashboard, Analytics, and Transactions
- **State Management**: React Query (@tanstack/react-query) for server state management, with local React state for UI state
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Charts**: Chart.js for data visualization including line charts for spending trends and doughnut charts for category breakdowns

## Backend Architecture
The backend uses Express.js with TypeScript and follows a simple REST API pattern:

- **Server Framework**: Express.js with TypeScript for type safety
- **Storage Interface**: Abstracted storage interface that currently uses in-memory storage but can be easily swapped for database persistence
- **Development Setup**: Vite integration for hot module replacement in development
- **API Design**: RESTful endpoints with /api prefix for clear separation from frontend routes

## Data Storage Solutions
The application currently uses a two-tier storage approach:

- **Frontend Storage**: LocalStorage for client-side persistence using a custom LocalTransactionStorage class
- **Backend Storage**: In-memory storage via MemStorage class implementing the IStorage interface
- **Database Ready**: Drizzle ORM configuration with PostgreSQL dialect prepared for future database integration
- **Schema Management**: Shared Zod schemas between frontend and backend for consistent data validation

## Database Schema
The transaction schema includes:
- **Transaction Entity**: id, type (income/expense), amount, category, description, date, createdAt
- **Predefined Categories**: Separate category constants for income and expense types with associated labels and icons
- **Validation**: Zod schemas for both full transactions and insert operations

## Authentication and Authorization
Currently, the application does not implement authentication, but the structure is prepared for future implementation with session-based authentication using connect-pg-simple for session storage.

# External Dependencies

## Frontend Dependencies
- **UI Components**: Radix UI primitives (@radix-ui/*) for accessible component foundations
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Charts**: Chart.js for data visualization
- **Forms**: React Hook Form with Hookform resolvers for validation
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Font Awesome icons via CSS classes
- **Utilities**: clsx and tailwind-merge for conditional styling

## Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection (configured but not actively used)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution and esbuild for production builds

## Development Dependencies
- **Build Tools**: Vite with React plugin and TypeScript support
- **Replit Integration**: Replit-specific plugins for development environment integration
- **Code Quality**: TypeScript with strict configuration for type safety

## Database Integration
- **Drizzle Configuration**: Set up for PostgreSQL with migrations directory
- **Environment Variables**: DATABASE_URL configuration for database connection
- **Migration Support**: Drizzle Kit configured for schema migrations and database push operations