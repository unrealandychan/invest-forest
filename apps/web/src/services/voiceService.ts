// Web Speech API Service (Speech Recognition & Speech Synthesis)

export class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public isSpeechSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    onResult: (transcript: string) => void,
    onError?: (err: any) => void
  ): void {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;

    this.stopSpeaking();

    // Clean text of markdown / symbols for clean voice
    const cleanText = text.replace(/[*_#`~[\]()]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92; // Calm, meditative pace
    utterance.pitch = 0.95;

    // Pick a natural soothing voice if available
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google UK'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceService = new VoiceService();
