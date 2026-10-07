import { PortfolioSummary, Holding } from '@invest-forest/core';

export type ProviderType = 'heuristic' | 'openai' | 'gemini' | 'anthropic' | 'ollama';

export interface AIConsultRequest {
  message?: string;
  summary: PortfolioSummary;
  holdings: Holding[];
  weather: string;
  provider?: ProviderType;
}

export interface AIConsultResponse {
  reply: string;
  mood: 'calm' | 'encouraging' | 'protective' | 'celebratory';
  wisdomQuote: string;
  recommendedAction?: string;
  providerUsed: ProviderType;
  modelUsed: string;
}

export interface EcologyAuditResponse {
  healthScore: number; // 0 - 100
  canopyStatus: string;
  biodiversityGrade: string;
  soilMoistureStatus: string;
  winterResilience: string;
  detailedAnalysis: string;
  actionItems: string[];
  providerUsed: ProviderType;
}

export interface PlantLoreResponse {
  symbol: string;
  speciesName: string;
  botanicalLore: string;
  temperament: string;
  nourishmentTip: string;
}

export interface LLMProvider {
  type: ProviderType;
  name: string;
  isAvailable(): boolean;
  generateText(systemPrompt: string, userPrompt: string): Promise<string>;
}
