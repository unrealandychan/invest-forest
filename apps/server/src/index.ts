import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { quotesRouter } from './routes/quotes';
import { syncRouter } from './routes/sync';
import { healthRouter } from './routes/health';
import { aiRouter } from './routes/ai';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// API Routes
app.use('/healthz', healthRouter);
app.use('/api/v1/quotes', quotesRouter);
app.use('/api/v1/sync', syncRouter);
app.use('/api/v1/ai', aiRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌲 Invest Forest Server listening on port ${PORT}`);
  });
}
