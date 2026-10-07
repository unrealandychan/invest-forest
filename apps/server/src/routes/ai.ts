import { Router, Request, Response } from 'express';
import { llmRegistry } from '../services/ai/LLMRegistry';

export const aiRouter = Router();

// Consult the Canopy Spirit
aiRouter.post('/consult', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, summary, holdings, weather, provider } = req.body;

    if (!summary) {
      res.status(400).json({ error: 'Portfolio summary is required for AI consultation' });
      return;
    }

    const consultation = await llmRegistry.consult({
      message,
      summary,
      holdings: holdings || [],
      weather: weather || 'sunny',
      provider,
    });

    res.status(200).json({
      success: true,
      consultation,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'AI consultation failed', message: err.message });
  }
});

// Deep Portfolio Ecology Audit
aiRouter.post('/audit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { summary, holdings, weather } = req.body;

    if (!summary) {
      res.status(400).json({ error: 'Portfolio summary is required for ecology audit' });
      return;
    }

    const audit = await llmRegistry.auditEcology(summary, holdings || [], weather || 'sunny');

    res.status(200).json({
      success: true,
      audit,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Ecology audit failed', message: err.message });
  }
});

// Plant Botanical Lore
aiRouter.get('/lore', async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = (req.query.symbol as string) || 'VOO';
    const assetClass = (req.query.assetClass as string) || 'broad_market';

    const lore = await llmRegistry.generatePlantLore(symbol, assetClass);

    res.status(200).json({
      success: true,
      lore,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate plant lore', message: err.message });
  }
});

// List Available LLM Providers
aiRouter.get('/providers', (_req: Request, res: Response): void => {
  const providers = llmRegistry.getAvailableProviders();
  const active = llmRegistry.getActiveProvider();

  res.status(200).json({
    success: true,
    activeProvider: active.type,
    activeProviderName: active.name,
    providers,
  });
});
