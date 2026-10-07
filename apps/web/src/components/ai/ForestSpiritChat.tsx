import React, { useState, useEffect } from 'react';
import { PortfolioSummary, Holding, WeatherCondition } from '@invest-forest/core';
import { voiceService } from '../../services/voiceService';
import {
  Bot,
  Sparkles,
  Send,
  X,
  BookOpen,
  RefreshCw,
  Footprints,
  Sprout,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ForestSpiritChatProps {
  summary: PortfolioSummary;
  holdings: Holding[];
  weather: WeatherCondition;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenCoolingOff: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'spirit' | 'user';
  text: string;
  wisdomQuote?: string;
  recommendedAction?: string;
  timestamp: string;
}

export const ForestSpiritChat: React.FC<ForestSpiritChatProps> = ({
  summary,
  holdings,
  weather,
  isOpen,
  onClose,
  onOpenDeposit,
  onOpenCoolingOff,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'spirit',
      text: `Greetings, guardian of the grove. I am the Canopy Spirit 🦉. I watch over your patient compounding, interpret seasonal market weather, and shield your timber against impulsive storms. Speak or write to me anytime.`,
      wisdomQuote: '"Doing well with money has a little to do with how smart you are and a lot to do with how you behave." — Morgan Housel',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  if (!isOpen) return null;

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          summary,
          holdings,
          weather,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const spiritReply: ChatMessage = {
          id: `spirit-${Date.now()}`,
          sender: 'spirit',
          text: data.consultation.reply,
          wisdomQuote: data.consultation.wisdomQuote,
          recommendedAction: data.consultation.recommendedAction,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, spiritReply]);

        if (autoVoice) {
          setIsSpeaking(true);
          voiceService.speak(spiritReply.text, () => setIsSpeaking(false));
        }
      } else {
        throw new Error('Backend AI offline');
      }
    } catch {
      // Offline behavioral fallback
      const offlineReply: ChatMessage = {
        id: `spirit-offline-${Date.now()}`,
        sender: 'spirit',
        text: `The forest whispers: Your net worth is $${summary.totalValue.toLocaleString()} across ${holdings.length} species. In current ${weather} market weather, resist the temptation to time the seasonal winds. Steady Dollar-Cost Averaging produces deeper annual growth rings than any speculative jump.`,
        wisdomQuote: '"Time in the market beats timing the market." — Jack Bogle',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, offlineReply]);
      if (autoVoice) {
        setIsSpeaking(true);
        voiceService.speak(offlineReply.text, () => setIsSpeaking(false));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        (transcript) => {
          setIsListening(false);
          setInputText(transcript);
          handleSendMessage(transcript);
        },
        () => setIsListening(false)
      );
    }
  };

  const handleSpeakMessage = (text: string) => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceService.speak(text, () => setIsSpeaking(false));
    }
  };

  const quickPrompts = [
    '🌲 Audit My Forest Ecology',
    '❄️ How do I endure bear markets?',
    '💧 What should I plant next?',
    '🛡️ I feel anxious about market drops',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-forest-950 border border-forest-600/40 rounded-3xl max-w-xl w-full h-[640px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-forest-900/60 border-b border-forest-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-800 border border-forest-600/50 flex items-center justify-center text-sprout shadow-sm">
              <Bot className="w-5 h-5 text-sunlit" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">The Canopy Spirit (Voice AI)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-800 border border-forest-600/40 text-sprout font-semibold">
                  Web Speech Enabled
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Behavioral compounding mentor with hands-free voice consultation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto Read Voice Toggle */}
            <button
              onClick={() => {
                const next = !autoVoice;
                setAutoVoice(next);
                if (!next) voiceService.stopSpeaking();
              }}
              title={autoVoice ? 'Mute Spirit Voice' : 'Enable Spirit Voice Narration'}
              className={`p-2 rounded-xl border transition ${
                autoVoice
                  ? 'bg-forest-700 border-sprout text-sprout'
                  : 'bg-forest-900/60 border-forest-800 text-slate-400 hover:text-white'
              }`}
            >
              {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                voiceService.stopListening();
                voiceService.stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-full bg-forest-900 hover:bg-forest-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md relative group ${
                  m.sender === 'user'
                    ? 'bg-forest-600 text-white rounded-br-sm'
                    : 'bg-forest-900/80 border border-forest-700/50 text-slate-200 rounded-bl-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1">{m.text}</p>
                  {m.sender === 'spirit' && (
                    <button
                      onClick={() => handleSpeakMessage(m.text)}
                      title="Read Message Aloud"
                      className="opacity-70 hover:opacity-100 p-1 text-sprout transition shrink-0"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {m.wisdomQuote && (
                  <div className="mt-2.5 pt-2 border-t border-forest-700/50 italic text-[11px] text-amber-200/90 flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                    <span>{m.wisdomQuote}</span>
                  </div>
                )}

                {m.recommendedAction && (
                  <div className="mt-2.5 pt-2 border-t border-forest-700/50 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-sprout font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-sunlit" />
                      <span>{m.recommendedAction}</span>
                    </div>
                    {m.recommendedAction.includes('Canopy Walk') ? (
                      <button
                        onClick={onOpenCoolingOff}
                        className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-300 rounded text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Footprints className="w-3 h-3" />
                        <span>Walk</span>
                      </button>
                    ) : (
                      <button
                        onClick={onOpenDeposit}
                        className="px-2 py-0.5 bg-forest-700 hover:bg-forest-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Sprout className="w-3 h-3" />
                        <span>Plant</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs px-2 py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sprout" />
              <span>Consulting the canopy roots...</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-2 text-amber-300 text-xs px-2 py-1 animate-pulse">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Listening to your voice... (speak your investment question)</span>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 border-t border-forest-800/60 bg-forest-950/60 flex gap-2 overflow-x-auto shrink-0">
          {quickPrompts.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-3 py-1 rounded-xl bg-forest-900 hover:bg-forest-800 border border-forest-700/50 text-slate-300 hover:text-white whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box with Microphone */}
        <div className="p-3 bg-forest-900/70 border-t border-forest-800 shrink-0 flex items-center gap-2">
          {voiceService.isSpeechSupported() && (
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              title={isListening ? 'Stop Listening' : 'Speak to Canopy Spirit'}
              className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                isListening
                  ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
                  : 'bg-forest-800 border-forest-700 text-slate-300 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            placeholder="Ask or speak to the Canopy Spirit about compounding, snowstorms..."
            className="flex-1 bg-forest-950 border border-forest-700/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sprout"
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-forest-500 hover:bg-forest-400 disabled:opacity-40 text-forest-950 rounded-xl transition shadow flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
