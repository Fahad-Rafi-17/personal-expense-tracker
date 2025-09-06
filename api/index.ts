import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
await registerRoutes(app);

// Export for Vercel
export default app;
