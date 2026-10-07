import { LLMProvider, ProviderType } from './types';

export class GeminiProvider implements LLMProvider {
  public type: ProviderType = 'gemini';
  public name = 'Google Gemini 1.5 Flash';
  private apiKey: string | null;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || null;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Gemini API key is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini provider');
      return text.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
}
