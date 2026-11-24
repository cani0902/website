import React from 'react';
import { Coins, Heart, Home, PiggyBank, Volume2, VolumeX } from 'lucide-react';
import { GameState } from '../game/types';

interface GameHudProps {
  state: GameState;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onBackToTitle: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  state,
  soundEnabled,
  onToggleSound,
  onBackToTitle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/70">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Title + Day */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onBackToTitle}
            title="처음 화면으로"
            className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
          <div className="whitespace-nowrap">
            <div className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              별빛마켓
            </div>
            <div className="text-[11px] font-bold text-amber-700 font-mono-num">
              DAY {state.day} / 7
            </div>
          </div>
        </div>

        {/* Zone 2: Key Game Resources */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-1.5 text-slate-900">
            <Coins className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-mono-num whitespace-nowrap">
              {state.cash.toLocaleString('ko-KR')}원
            </span>
          </div>

          {state.savings > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-sky-700">
              <PiggyBank className="w-4 h-4 shrink-0" />
              <span className="font-mono-num whitespace-nowrap">
                저축 {state.savings.toLocaleString('ko-KR')}원
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-rose-600">
            <Heart className="w-4 h-4 fill-rose-500 shrink-0" />
            <span className="font-mono-num whitespace-nowrap">{state.satisfaction}%</span>
          </div>
        </div>

        {/* Zone 3: Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-sky-700" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </header>
  );
};
