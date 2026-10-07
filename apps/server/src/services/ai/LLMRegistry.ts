import {
  LLMProvider,
  ProviderType,
  AIConsultRequest,
  AIConsultResponse,
  EcologyAuditResponse,
  PlantLoreResponse,
} from './types';
import { HeuristicProvider } from './HeuristicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GeminiProvider } from './GeminiProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { Holding, PortfolioSummary } from '@invest-forest/core';

export class LLMRegistry {
  private providers: Map<ProviderType, LLMProvider> = new Map();
  private heuristic: HeuristicProvider;

  constructor() {
    this.heuristic = new HeuristicProvider();
    this.providers.set('heuristic', this.heuristic);
    this.providers.set('openai', new OpenAIProvider(false));
    this.providers.set('ollama', new OpenAIProvider(true));
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('anthropic', new AnthropicProvider());
  }

  public getAvailableProviders(): { type: ProviderType; name: string; available: boolean }[] {
    return Array.from(this.providers.values()).map((p) => ({
      type: p.type,
      name: p.name,
      available: p.isAvailable(),
    }));
  }

  public getActiveProvider(requested?: ProviderType): LLMProvider {
    if (requested && this.providers.has(requested)) {
      const p = this.providers.get(requested)!;
      if (p.isAvailable()) return p;
    }

    const envPref = process.env.LLM_PROVIDER || 'auto';
    if (envPref !== 'auto' && this.providers.has(envPref as ProviderType)) {
      const p = this.providers.get(envPref as ProviderType)!;
      if (p.isAvailable()) return p;
    }

    // Auto priority order: OpenAI -> Gemini -> Anthropic -> Ollama -> Heuristic
    const priority: ProviderType[] = ['openai', 'gemini', 'anthropic', 'ollama'];
    for (const type of priority) {
      const p = this.providers.get(type);
      if (p && p.isAvailable()) return p;
    }

    return this.heuristic;
  }

  public async consult(req: AIConsultRequest): Promise<AIConsultResponse> {
    const provider = this.getActiveProvider(req.provider);
    const systemPrompt = `You are the Canopy Spirit, the wise and serene botanical guardian of Invest Forest.
You embody the long-term compounding principles of Morgan Housel ("The Psychology of Money") and Nick Maggiulli ("Just Keep Buying").
Speak calmly, poetically, and authoritatively about financial patience, Dollar-Cost Averaging, and botanical growth.
Frame drawdowns as winter snow/fertilizer, holding periods as annual growth rings, and stocks/bonds as trees.
Keep your response concise (2-4 sentences max), accompanied by a calm actionable takeaway.`;

    const userPrompt = `Cultivator portfolio state:
- Net Worth: $${req.summary.totalValue.toLocaleString()}
- Unrealized Growth: ${req.summary.unrealizedGainPercent.toFixed(1)}% ($${req.summary.unrealizedGain.toLocaleString()})
- Annualized XIRR: ${(req.summary.xirr * 100).toFixed(1)}%
- DCA Deposits Streak: ${req.summary.dcaStreak}
- Current Forest Weather: ${req.weather}
- Holdings: ${req.holdings.map((h) => `${h.symbol} (${h.assetClass})`).join(', ') || 'Fresh meadow soil'}
User Question: "${req.message || 'Canopy advice for today'}"`;

    let reply: string;
    try {
      reply = await provider.generateText(systemPrompt, userPrompt);
    } catch (err: any) {
      console.warn(`Provider ${provider.name} failed, falling back to Heuristic:`, err.message);
      reply = await this.heuristic.generateText(systemPrompt, userPrompt);
    }

    const isDrawdown = req.summary.unrealizedGain < 0;
    const mood = (req.message && req.message.toLowerCase().includes('sell'))
      ? 'protective'
      : (req.weather === 'winter_snow' || isDrawdown)
      ? 'encouraging'
      : req.summary.dcaStreak >= 3
      ? 'celebratory'
      : 'calm';

    const quotes = [
      '"The highest form of wealth is the ability to wake up and say, I can do whatever I want today." — Morgan Housel',
      '"Just keep buying. The single biggest driver of long-term wealth is buying income-producing assets consistently." — Nick Maggiulli',
      '"Doing well with money has a little to do with how smart you are and a lot to do with how you behave." — Morgan Housel',
      '"Time in the market beats timing the market, every single time." — Jack Bogle',
    ];
    const wisdomQuote = quotes[Math.abs(req.summary.dcaStreak) % quotes.length];

    return {
      reply,
      mood,
      wisdomQuote,
      recommendedAction: isDrawdown
        ? 'Plant a disciplined DCA deposit while seedlings are on discount'
        : 'Maintain steady monthly cadence and avoid over-pruning',
      providerUsed: provider.type,
      modelUsed: provider.name,
    };
  }

  public async auditEcology(
    summary: PortfolioSummary,
    holdings: Holding[],
    weather: string
  ): Promise<EcologyAuditResponse> {
    const provider = this.getActiveProvider();

    // Deterministic ecological health calculation
    const hasCore = holdings.some((h) => h.assetClass === 'broad_market');
    const hasCash = summary.cashBalance > 0;
    const isDiversified = holdings.length >= 2;
    const baseScore = (hasCore ? 45 : 20) + (hasCash ? 20 : 5) + (isDiversified ? 25 : 10) + Math.min(10, summary.dcaStreak * 2);
    const healthScore = Math.min(100, Math.max(20, baseScore));

    const biodiversityGrade = holdings.length >= 3 ? 'A (Flourishing Biome)' : holdings.length === 2 ? 'B (Balanced Canopy)' : 'C (Single Species Monoculture)';
    const soilMoistureStatus = summary.cashBalance > 1000 ? 'Ample Freshwater Flow' : summary.cashBalance > 200 ? 'Moist & Receptive' : 'Dry Soil (Needs Cash Stream Buffer)';
    const winterResilience = summary.unrealizedGainPercent > -15 ? 'High Frost Insulation' : 'Winter Dormancy Active';

    const actionItems: string[] = [];
    if (!hasCore) actionItems.push('Plant Ancient Oak (VOO/VTI) to establish a resilient trunk foundation.');
    if (summary.cashBalance < 500) actionItems.push('Replenish liquid stream reserves to nourish future bear market dips.');
    if (holdings.length < 3) actionItems.push('Cultivate Honey Apple (Dividend) or Silver Willow (Bond) to broaden biodiversity.');
    if (actionItems.length === 0) actionItems.push('Flourishing equilibrium: continue scheduled Dollar-Cost Averaging.');

    return {
      healthScore,
      canopyStatus: healthScore > 80 ? 'Robust Ancient Forest' : healthScore > 60 ? 'Maturing Woodland' : 'Young Seedling Grove',
      biodiversityGrade,
      soilMoistureStatus,
      winterResilience,
      detailedAnalysis: `Your grove holds $${summary.totalValue.toLocaleString()} in net value across ${holdings.length} species. With an XIRR of ${(summary.xirr * 100).toFixed(1)}% and ${summary.dcaStreak} recorded DCA cycles, root depth is solid.`,
      actionItems,
      providerUsed: provider.type,
    };
  }

  public async generatePlantLore(symbol: string, assetClass: string): Promise<PlantLoreResponse> {
    const sym = symbol.toUpperCase();
    const speciesNames: Record<string, string> = {
      VOO: 'S&P 500 Ancient Oak',
      VTI: 'Total Market Giant Redwood',
      SCHD: 'Honey Apple Orchard',
      BND: 'Silver Stability Willow',
      VT: 'Pangaea Global Baobab',
    };

    const speciesName = speciesNames[sym] || `${sym} Botanical Hybrid`;

    return {
      symbol: sym,
      speciesName,
      botanicalLore: `A deeply rooted specimen in the ${assetClass} family. Renowned for weathering macro-economic winter seasons and producing persistent capital growth rings year over year.`,
      temperament: 'Patient, wind-resistant, and compounding-oriented.',
      nourishmentTip: 'Requires regular monthly rainfall deposits; do not shake branches during price volatility.',
    };
  }
}

export const llmRegistry = new LLMRegistry();
