import React, { useState } from 'react';
import { ArrowRight, Lightbulb, Percent, Sun, Tag } from 'lucide-react';
import { DayConfig } from '../game/types';
import { soundFx } from '../utils/soundFx';

interface DayStoryCardProps {
  config: DayConfig;
  effectiveUnitCost: number;
  onProceed: () => void;
}

export const DayStoryCard: React.FC<DayStoryCardProps> = ({
  config,
  effectiveUnitCost,
  onProceed,
}) => {
  const [imgError, setImgError] = useState(false);

  const portraitSrc =
    config.speakerId === 'bear'
      ? '/src/assets/images/character_bear_customer_1795533143077.jpg'
      : '/src/assets/images/character_owl_banker_1795533144138.jpg';

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Top Day Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-700">
              DAY {config.day} · {config.weatherLabel}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              {config.title}
            </h2>
          </div>
          <Sun className="w-7 h-7 text-amber-400 shrink-0" />
        </div>

        {/* Character Portrait + Dialogue */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 sm:p-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-amber-200 bg-white shrink-0">
            {!imgError ? (
              <img
                src={portraitSrc}
                alt={config.speakerName}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-amber-800">
                {config.speakerName}
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="text-xs font-bold text-amber-800">
              {config.speakerName} · <span className="font-medium text-slate-500">{config.speakerRole}</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              {config.storyText}
            </p>
          </div>
        </div>

        {/* Today's Economic Hints */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 flex items-center gap-3">
            <Tag className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500">오늘 재료 원가</div>
              <div className="text-base font-extrabold font-mono-num text-slate-900">
                개당 {effectiveUnitCost.toLocaleString('ko-KR')}원
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 flex items-center gap-3">
            <Percent className="w-4 h-4 text-sky-700 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-500">오늘 반짝은행 금리</div>
              <div className="text-base font-extrabold font-mono-num text-slate-900">
                하루 {config.bankRatePct}%
              </div>
            </div>
          </div>
        </div>

        {/* Easy Economic Secret */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-sky-900">
              {config.economicLessonTitle}
            </div>
            <p className="text-xs sm:text-sm text-sky-950/80 leading-relaxed">
              {config.economicTip}
            </p>
          </div>
        </div>

        {/* Proceed CTA */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onProceed();
          }}
          className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
        >
          <span>가게 준비하러 가기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
