import { LLMProvider, ProviderType } from './types';

export class OpenAIProvider implements LLMProvider {
  public type: ProviderType;
  public name: string;
  private apiKey: string | null;
  private apiBase: string;
  private model: string;

  constructor(isOllama: boolean = false) {
    this.type = isOllama ? 'ollama' : 'openai';
    this.name = isOllama ? 'Ollama Local LLM (OpenAI Compatible)' : 'OpenAI GPT-4o-mini';
    this.apiKey = isOllama ? (process.env.OLLAMA_API_KEY || 'ollama') : (process.env.OPENAI_API_KEY || null);
    this.apiBase = isOllama
      ? (process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1')
      : (process.env.OPENAI_API_BASE || 'https://api.openai.com/v1');
    this.model = isOllama
      ? (process.env.OLLAMA_MODEL || 'llama3:latest')
      : (process.env.OPENAI_MODEL || 'gpt-4o-mini');
  }

  public isAvailable(): boolean {
    if (this.type === 'ollama') {
      return Boolean(process.env.OLLAMA_BASE_URL || process.env.ENABLE_OLLAMA === 'true');
    }
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateText(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error(`${this.name} is not configured`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey || 'anonymous'}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as any;
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from OpenAI provider');
      return text.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
}
