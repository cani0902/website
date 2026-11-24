import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, Coins, Heart, RotateCcw, Store } from 'lucide-react';
import { GameState } from '../game/types';
import { evaluateGameEnding } from '../game/economyLogic';
import { soundFx } from '../utils/soundFx';

interface EndingScreenProps {
  state: GameState;
  onRestart: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({ state, onRestart }) => {
  const [imgError, setImgError] = useState(false);
  const ending = evaluateGameEnding(state);

  const chartData = state.history.map((h) => ({
    dayLabel: `DAY ${h.day}`,
    totalAssets: h.totalAssets,
    netProfit: h.netProfit,
  }));

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      <div className="bg-white border border-amber-200/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Top Illustrated Banner */}
        <div className="relative h-44 sm:h-52 bg-slate-900">
          {!imgError ? (
            <img
              src="/src/assets/images/starlight_shop_hero_1795533143939.jpg"
              alt="별빛 상점 엔딩"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-200">
              <Store className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Award className="w-4 h-4" />
              <span>{ending.badgeLabel}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {ending.title}
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Grandpa's Epilogue */}
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 sm:p-5 space-y-1">
            <div className="text-xs font-bold text-amber-800">할아버지의 한마디</div>
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
              {ending.endingNarrative}
            </p>
          </div>

          {/* Key Final Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                최종 자산
              </div>
              <div className="text-lg sm:text-2xl font-extrabold font-mono-num text-slate-900 mt-1">
                {ending.totalAssets.toLocaleString('ko-KR')}원
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                단골 만족도
              </div>
              <div className="text-lg sm:text-2xl font-extrabold font-mono-num text-slate-900 mt-1">
                {state.satisfaction}%
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="text-xs text-slate-500">누적 순수익</div>
              <div className="text-lg sm:text-2xl font-extrabold font-mono-num text-emerald-700 mt-1">
                {ending.totalProfit >= 0 ? '+' : ''}
                {ending.totalProfit.toLocaleString('ko-KR')}원
              </div>
            </div>
          </div>

          {/* 7-Day Growth Chart */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900">7일간의 가게 자산 성장 기록</h3>
            <div className="w-full h-[200px] bg-slate-50/60 border border-slate-200/70 rounded-2xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
                  />
                  <Tooltip
                    formatter={(val) => [`${Number(val ?? 0).toLocaleString('ko-KR')}원`, '총 자산']}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalAssets"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    fill="#fde68a"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Play Again */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onRestart();
            }}
            className="w-full min-h-[52px] rounded-2xl bg-slate-900 text-white font-extrabold text-base hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
          >
            <RotateCcw className="w-5 h-5" />
            <span>새로운 모험 다시 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
