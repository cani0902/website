import React from 'react';
import { ArrowRight, CheckCircle2, Coins, Lightbulb, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { DayResult } from '../game/types';
import { soundFx } from '../utils/soundFx';

interface DaySummaryCardProps {
  result: DayResult;
  isFinalDay: boolean;
  onNextDay: () => void;
}

export const DaySummaryCard: React.FC<DaySummaryCardProps> = ({
  result,
  isFinalDay,
  onNextDay,
}) => {
  const isProfit = result.netProfit >= 0;

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 px-4">
      <div className="bg-white border border-amber-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-700">DAY {result.day} 저녁 정산</div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              오늘의 별빛 상점 장부
            </h2>
          </div>

          <div
            className={`px-3.5 py-2 rounded-xl font-extrabold font-mono-num text-base inline-flex items-center gap-1.5 ${
              isProfit
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {isProfit ? '+' : ''}
              {result.netProfit.toLocaleString('ko-KR')}원
            </span>
          </div>
        </div>

        {/* Sales Summary */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-500">만든 개수</div>
            <div className="text-lg font-extrabold font-mono-num text-slate-900 mt-0.5">
              {result.producedQty}개
            </div>
          </div>
          <div className="bg-emerald-50/70 rounded-2xl p-3.5">
            <div className="text-[11px] text-emerald-700 font-semibold">팔린 개수</div>
            <div className="text-lg font-extrabold font-mono-num text-emerald-800 mt-0.5">
              {result.soldQty}개
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-500">남은 재고</div>
            <div className="text-lg font-extrabold font-mono-num text-slate-700 mt-0.5">
              {result.leftoverQty}개
            </div>
          </div>
        </div>

        {/* Financial Receipt Lines */}
        <div className="space-y-2.5 text-sm bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 sm:p-5">
          <div className="flex justify-between">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              간식 판매 매출
            </span>
            <span className="font-bold font-mono-num text-slate-900">
              +{result.revenue.toLocaleString('ko-KR')}원
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-rose-500" />
              재료 원가 지출
            </span>
            <span className="font-bold font-mono-num text-rose-600">
              -{result.productionCost.toLocaleString('ko-KR')}원
            </span>
          </div>
          {result.bankInterestEarned > 0 && (
            <div className="flex justify-between">
              <span className="text-sky-700">반짝은행 예금 이자 수익</span>
              <span className="font-bold font-mono-num text-sky-700">
                +{result.bankInterestEarned.toLocaleString('ko-KR')}원
              </span>
            </div>
          )}
          {result.loanInterestPaid > 0 && (
            <div className="flex justify-between">
              <span className="text-amber-700">은행 대출 이자 지출</span>
              <span className="font-bold font-mono-num text-amber-700">
                -{result.loanInterestPaid.toLocaleString('ko-KR')}원
              </span>
            </div>
          )}
          <div className="pt-2.5 border-t border-slate-200 flex justify-between font-extrabold">
            <span className="text-slate-900">총 보유 자산 (현금+예금-대출)</span>
            <span className="font-mono-num text-slate-900">
              {result.totalAssets.toLocaleString('ko-KR')}원
            </span>
          </div>
        </div>

        {/* Chosen Event Pill-free note */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>오늘의 선택: <strong className="text-slate-900">{result.chosenEventLabel}</strong></span>
        </div>

        {/* Personalized Economic Advice */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-extrabold text-sky-900">오늘의 경제 비결 노트</div>
            <p className="text-xs sm:text-sm text-sky-950/85 leading-relaxed">
              {result.adviceText}
            </p>
          </div>
        </div>

        {/* Next Day CTA */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onNextDay();
          }}
          className="w-full min-h-[52px] rounded-2xl bg-slate-900 text-white font-extrabold text-base hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
        >
          <span>{isFinalDay ? '7일 모험 최종 결과 보기!' : `DAY ${result.day + 1} 아침으로 가기`}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
