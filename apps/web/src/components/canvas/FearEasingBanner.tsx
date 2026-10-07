import React, { useState, useEffect } from 'react';
import { voiceService } from '../../services/voiceService';
import { soundscapeService } from '../../services/soundscapeService';
import { Snowflake, Headphones, Sprout, X, Volume2, Pause } from 'lucide-react';

interface FearEasingBannerProps {
  unrealizedGainPercent: number;
  weather: string;
  onOpenDeposit: () => void;
}

export const FearEasingBanner: React.FC<FearEasingBannerProps> = ({
  unrealizedGainPercent,
  weather,
  onOpenDeposit,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  const isMarketWinter = weather === 'winter_snow' || unrealizedGainPercent < -5;

  useEffect(() => {
    let timer: any = null;
    if (isPlayingAudio && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleStopAudio();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio, secondsRemaining]);

  if (!isMarketWinter || isDismissed) return null;

  const groundingText =
    "Take a slow, deep breath under the canopy. Look at your trees. In nature, trees do not panic and uproot their trunks during a winter freeze. They insulate their root soil, slow their metabolism, and patiently wait. Market downturns are natural winter seasons. Every dollar you invest right now acquires discount seedlings at depressed valuations that will bloom vigorously in the next summer expansion. Volatility is not a fine; it is the price of admission for generational compounding. Stay rooted.";

  const handleStartAudio = () => {
    setIsPlayingAudio(true);
    setSecondsRemaining(60);
    soundscapeService.start();
    voiceService.speak(groundingText, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleStopAudio = () => {
    setIsPlayingAudio(false);
    voiceService.stopSpeaking();
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-30 select-none animate-in slide-in-from-top-4">
      <div className="bg-cyan-950/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-3 shadow-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-cyan-900/80 border border-cyan-400/40 text-cyan-200">
              <Snowflake className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Market Winter Active</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 font-mono">
                  {unrealizedGainPercent.toFixed(1)}% Drawdown
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/90">
                Soil is absorbing deep root nutrients beneath the frost. Do not uproot timber in the cold.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPlayingAudio ? (
              <button
                onClick={handleStartAudio}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 border border-cyan-400/40"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>60s Grounding 🎧</span>
              </button>
            ) : (
              <button
                onClick={handleStopAudio}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>{secondsRemaining}s • Stop</span>
              </button>
            )}

            <button
              onClick={onOpenDeposit}
              className="px-3 py-1.5 bg-forest-600 hover:bg-forest-500 text-sprout rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 border border-forest-500/40"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Discount Seeds 🌱</span>
            </button>

            <button
              onClick={() => {
                handleStopAudio();
                setIsDismissed(true);
              }}
              className="p-1 rounded-lg text-cyan-300/70 hover:text-white transition"
              title="Dismiss Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio Waveform / Countdown Progress */}
        {isPlayingAudio && (
          <div className="pt-1 space-y-1 animate-in fade-in">
            <div className="w-full h-1.5 bg-cyan-900 rounded-full overflow-hidden">
              <div
                style={{ width: `${((60 - secondsRemaining) / 60) * 100}%` }}
                className="h-full bg-cyan-300 transition-all duration-1000"
              />
            </div>
            <div className="flex justify-between text-[10px] text-cyan-300 font-mono">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse" />
                Canopy Spirit Voice Grounding Active...
              </span>
              <span>{secondsRemaining}s remaining</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
