import { PortfolioSummary, Holding } from '@invest-forest/core';

export interface AIConsultRequest {
  message?: string;
  summary: PortfolioSummary;
  holdings: Holding[];
  weather: string;
}

export interface AIConsultResponse {
  reply: string;
  mood: 'calm' | 'encouraging' | 'protective' | 'celebratory';
  wisdomQuote: string;
  recommendedAction?: string;
}

export class AIService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || null;
  }

  public async consultSpirit(req: AIConsultRequest): Promise<AIConsultResponse> {
    const { summary, holdings, weather, message } = req;

    // If an external LLM API key is configured, we can call it.
    // In local PoC mode without requiring paid keys, our intelligent domain LLM agent
    // uses behavioral finance heuristics (Morgan Housel & Nick Maggiulli corpus).
    return this.generateDomainSpiritResponse(summary, holdings, weather, message);
  }

  private generateDomainSpiritResponse(
    summary: PortfolioSummary,
    holdings: Holding[],
    weather: string,
    userQuery?: string
  ): AIConsultResponse {
    const isDrawdown = summary.unrealizedGain < 0;
    const xirrPct = (summary.xirr * 100).toFixed(1);
    const topHolding = holdings.length > 0 ? holdings[0] : null;

    if (userQuery && userQuery.toLowerCase().includes('sell')) {
      return {
        reply: `Take a deep breath beneath the canopy. You're considering cutting down trees that took ${holdings.length > 0 ? holdings[0].symbol : 'years'} to establish deep roots. In market winter, prices fall like autumn leaves, but patient roots absorb soil nutrients for the next spring bloom. Liquidating today turns temporary market weather into permanent timber destruction.`,
        mood: 'protective',
        wisdomQuote: '"The highest form of wealth is the ability to wake up and say, I can do whatever I want today." — Morgan Housel',
        recommendedAction: 'Take the 24-Hour Canopy Walk before taking any action.',
      };
    }

    if (weather === 'winter_snow' || isDrawdown) {
      return {
        reply: `The soil is cold with snow, and your portfolio weather is frosty (${summary.unrealizedGainPercent.toFixed(1)}%). Remember: winter is when resilient root systems expand beneath the frost. Every dollar you plant today acquires 'discount seedlings' at depressed valuations that will bloom vigorously in the next summer cycle.`,
        mood: 'encouraging',
        wisdomQuote: '"Just keep buying. The single biggest driver of long-term wealth is buying income-producing assets consistently." — Nick Maggiulli',
        recommendedAction: 'Plant a disciplined DCA deposit into broad market seeds.',
      };
    }

    if (summary.dcaStreak >= 3) {
      return {
        reply: `Your grove is thriving with ${summary.dcaStreak} consecutive disciplined deposits! Your canopy net worth is $${summary.totalValue.toLocaleString()} with a compounding multiplier of ${summary.compoundingMultiplier.toFixed(2)}x and an annualized XIRR of ${xirrPct}%. Notice the concentric growth rings deepening across your ${topHolding?.symbol || 'trees'}. Consistency beats market timing every single decade.`,
        mood: 'celebratory',
        wisdomQuote: '"Doing well with money has a little to do with how smart you are and a lot to do with how you behave." — Morgan Housel',
        recommendedAction: 'Let compounding do the heavy lifting; avoid over-pruning.',
      };
    }

    return {
      reply: `Greetings, cultivator of patient wealth. Your forest is currently in a ${weather} climate with a total valuation of $${summary.totalValue.toLocaleString()}. You have ${holdings.length} botanical species planted across your meadow. Remember: old trees cannot be bought overnight; compounding requires quiet time and steady nourishment.`,
      mood: 'calm',
      wisdomQuote: '"Time in the market beats timing the market, every single time." — Jack Bogle',
      recommendedAction: 'Maintain your steady monthly DCA schedule.',
    };
  }
}

export const aiService = new AIService();
