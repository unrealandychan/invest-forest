import { LLMProvider, ProviderType } from './types';

export class HeuristicProvider implements LLMProvider {
  public type: ProviderType = 'heuristic';
  public name = 'Canopy Spirit Offline Heuristic';

  public isAvailable(): boolean {
    return true; // Always available without network or API keys
  }

  public async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    const lower = userPrompt.toLowerCase();

    if (lower.includes('sell') || lower.includes('liquidate') || lower.includes('fear')) {
      return `Take a calm breath under the branches. Panic selling during a correction uproots trees right when their root systems are digging deeper for nutrients. History teaches us that the best buying opportunities always masquerade as frightening headlines. Delay any sale for at least 24 hours.`;
    }

    if (lower.includes('winter') || lower.includes('bear') || lower.includes('drawdown')) {
      return `Winter weather blankets the soil with frost, but deciduous trees do not despair. A 15-25% market drawdown is simply natural weather. By executing Dollar-Cost Averaging now, you are purchasing fertile discount seedlings that will bloom tenfold during the eventual spring recovery.`;
    }

    if (lower.includes('audit') || lower.includes('ecology') || lower.includes('health')) {
      return `Your forest ecosystem shows healthy canopy development. Maintain balanced biodiversity between Broad Market Oaks for core structure and Cash Streams for liquid dry-powder nourishment. Avoid crowding more than 10% of your soil with Wild Speculative Mushrooms.`;
    }

    return `The forest grows in silence through the power of compounding. Time in the market will always surpass timing the winds. Stay disciplined with your regular monthly deposits and let nature do the heavy lifting.`;
  }
}
