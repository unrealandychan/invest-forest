import { LLMProvider, ProviderType } from './types';

export class AnthropicProvider implements LLMProvider {
  public type: ProviderType = 'anthropic';
  public name = 'Anthropic Claude 3.5 Sonnet';
  private apiKey: string | null;
  private model: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || null;
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Anthropic API key is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          max_tokens: 400,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Anthropic HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;
      const text = data?.content?.[0]?.text;
      if (!text) throw new Error('Empty response from Anthropic provider');
      return text.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
}
