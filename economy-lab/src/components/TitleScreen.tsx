import React, { useState } from 'react';
import { ArrowRight, Coins, PiggyBank, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { GameMode } from '../game/types';
import { soundFx } from '../utils/soundFx';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-5xl w-full mx-auto bg-white border border-amber-200/80 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left: Cozy Storybook Illustration */}
          <div className="lg:col-span-7 relative min-h-[240px] sm:min-h-[340px] bg-slate-900 overflow-hidden">
            {!imgError ? (
              <img
                src="/src/assets/images/starlight_shop_hero_1795533143939.jpg"
                alt="별빛마을의 따뜻한 별빛 상점과 동물 친구들"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-amber-900 text-amber-100 p-8">
                <Store className="w-12 h-12" />
                <span className="font-bold text-lg">별빛마을 상점</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <p className="text-xs font-bold text-amber-300 tracking-wide">
                7일간의 인터랙티브 경제 모험 게임
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 leading-tight">
                별빛마켓: 꼬마 사장님의 경제 모험
              </h1>
            </div>
          </div>

          {/* Right: Story Hook & Game Start */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  “7일 동안 할아버지의 가게를 지켜줘!”
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  방학을 맞아 별빛마을의 작은 간식 가게를 맡게 되었어요. 매일 달라지는 마을 사건 속에서{' '}
                  <strong className="text-slate-900">가격, 재료 수량, 은행 저축·투자</strong>를 직접 결정하며 최고의 사장님에 도전해 보세요!
                </p>
              </div>

              {/* 3 Core Fun Concepts */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 bg-amber-50/70 border border-amber-200/60 rounded-xl px-3.5 py-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">수요와 공급:</strong> 손님이 좋아하는 가격과 개수를 맞혀 완판하기!
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-sky-50/70 border border-sky-200/60 rounded-xl px-3.5 py-2.5">
                  <PiggyBank className="w-4 h-4 text-sky-700 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">금리와 투자:</strong> 은행 이자로 돈을 불리거나 가게 오븐 업그레이드!
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-rose-50/70 border border-rose-200/60 rounded-xl px-3.5 py-2.5">
                  <Coins className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">돌발 선택:</strong> 소풍, 재료값 상승, 라이벌 가게까지 직접 해결!
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  soundFx.playSuccess();
                  onStartGame('story');
                }}
                className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
              >
                <span>7일 스토리 모험 시작</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onStartGame('free');
                }}
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-sm hover:bg-amber-100 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>자유 장사 모드 (자본금 30,000원으로 시작)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
