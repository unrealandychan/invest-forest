import { Router, Request, Response } from 'express';
import { quoteService } from '../services/quoteService';

export const quotesRouter = Router();

quotesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSymbols = (req.query.symbols as string) || 'VOO,BND,SCHD';
    const symbols = rawSymbols
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (symbols.length === 0) {
      res.status(400).json({ error: 'At least one valid symbol must be supplied' });
      return;
    }

    const quotes = await quoteService.getQuotes(symbols);
    res.status(200).json({
      success: true,
      count: Object.keys(quotes).length,
      quotes,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch market quotes', message: err.message });
  }
});
