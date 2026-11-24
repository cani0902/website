import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Coins, FastForward, Package, Sparkles } from 'lucide-react';
import { CustomerVisit, DayConfig, MiddayChoice } from '../game/types';
import { generateCustomerVisits } from '../game/economyLogic';
import { soundFx } from '../utils/soundFx';

interface LiveShopFloorProps {
  dayConfig: DayConfig;
  producedQty: number;
  sellingPrice: number;
  effectiveDemand: number;
  fairPrice: number;
  onFinishDay: (result: {
    finalProducedQty: number;
    finalSoldQty: number;
    finalSellingPrice: number;
    extraStockCost: number;
    satisfactionDelta: number;
    chosenEventLabel: string;
  }) => void;
}

export const LiveShopFloor: React.FC<LiveShopFloorProps> = ({
  dayConfig,
  producedQty,
  sellingPrice,
  effectiveDemand,
  fairPrice,
  onFinishDay,
}) => {
  // Split day into Morning Rush -> Midday Event Choice -> Afternoon Rush
  const [stage, setStage] = useState<'morning' | 'event' | 'afternoon' | 'done'>('morning');
  const [chosenOption, setChosenOption] = useState<MiddayChoice | null>(null);

  // Morning visits (half of initial stock / demand)
  const morningData = useMemo(() => {
    const halfStock = Math.ceil(producedQty / 2);
    const halfDemand = Math.ceil(effectiveDemand / 2);
    return generateCustomerVisits(halfStock, sellingPrice, halfDemand, fairPrice);
  }, [producedQty, sellingPrice, effectiveDemand, fairPrice]);

  // Afternoon visits (computed dynamically once midday choice is picked)
  const afternoonData = useMemo(() => {
    if (!chosenOption) return { visits: [] as CustomerVisit[], soldQty: 0 };
    const remainingMorningStock = Math.max(0, Math.ceil(producedQty / 2) - morningData.soldQty);
    const afternoonStock =
      Math.floor(producedQty / 2) + remainingMorningStock + chosenOption.extraStock;
    const afternoonPrice = Math.max(800, sellingPrice + chosenOption.priceAdjust);
    const afternoonDemand = Math.max(
      4,
      Math.floor(effectiveDemand / 2) + chosenOption.demandBoost,
    );
    return generateCustomerVisits(
      afternoonStock,
      afternoonPrice,
      afternoonDemand,
      fairPrice,
    );
  }, [chosenOption, producedQty, morningData.soldQty, sellingPrice, effectiveDemand, fairPrice]);

  const [morningIndex, setMorningIndex] = useState(0);
  const [afternoonIndex, setAfternoonIndex] = useState(0);

  // Morning animation loop
  useEffect(() => {
    if (stage !== 'morning') return;
    if (morningIndex >= morningData.visits.length) {
      soundFx.playEventAlert();
      setStage('event');
      return;
    }

    const timer = window.setTimeout(() => {
      const visit = morningData.visits[morningIndex];
      if (visit?.bought) {
        soundFx.playCoin();
      }
      setMorningIndex((prev) => prev + 1);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [stage, morningIndex, morningData.visits]);

  // Afternoon animation loop
  useEffect(() => {
    if (stage !== 'afternoon') return;
    if (afternoonIndex >= afternoonData.visits.length) {
      setStage('done');
      return;
    }

    const timer = window.setTimeout(() => {
      const visit = afternoonData.visits[afternoonIndex];
      if (visit?.bought) {
        soundFx.playCoin();
      }
      setAfternoonIndex((prev) => prev + 1);
    }, 260);

    return () => window.clearTimeout(timer);
  }, [stage, afternoonIndex, afternoonData.visits]);

  const visibleMorning = morningData.visits.slice(0, morningIndex);
  const visibleAfternoon = afternoonData.visits.slice(0, afternoonIndex);
  const allVisible = [...visibleMorning, ...visibleAfternoon];

  const soldSoFar =
    visibleMorning.filter((v) => v.bought).length +
    visibleAfternoon.filter((v) => v.bought).length;
  const revenueSoFar =
    visibleMorning.reduce((s, v) => s + v.pricePaid, 0) +
    visibleAfternoon.reduce((s, v) => s + v.pricePaid, 0);
  const currentTotalStock = producedQty + (chosenOption?.extraStock ?? 0);
  const stockLeft = Math.max(0, currentTotalStock - soldSoFar);
  const latestVisit = allVisible[allVisible.length - 1];

  const handleSelectEventChoice = (choice: MiddayChoice) => {
    soundFx.playCashRegister();
    setChosenOption(choice);
    setStage('afternoon');
  };

  const handleCompleteDay = () => {
    if (!chosenOption) return;
    const totalSold = morningData.soldQty + afternoonData.soldQty;
    const avgSellingPrice =
      totalSold > 0
        ? Math.round(
            (morningData.soldQty * sellingPrice +
              afternoonData.soldQty * Math.max(800, sellingPrice + chosenOption.priceAdjust)) /
              totalSold,
          )
        : sellingPrice;

    onFinishDay({
      finalProducedQty: currentTotalStock,
      finalSoldQty: totalSold,
      finalSellingPrice: avgSellingPrice,
      extraStockCost: chosenOption.stockCost,
      satisfactionDelta: chosenOption.satisfactionDelta,
      chosenEventLabel: chosenOption.label,
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-5">
      {/* Live Counter Header */}
      <div className="bg-white border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-amber-700">
              DAY {dayConfig.day} · {stage === 'morning' ? '오전 영업 중' : stage === 'event' ? '한낮 돌발 상황!' : stage === 'afternoon' ? '오후 영업 중' : '오늘 영업 종료!'}
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">별빛 상점 카운터</h2>
          </div>

          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <Package className="w-4 h-4 text-sky-600" />
              <span className="font-mono-num">남은 간식 {stockLeft}개</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-700">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-mono-num">+{revenueSoFar.toLocaleString('ko-KR')}원</span>
            </span>
          </div>
        </div>

        {/* Active Customer Reaction Stage */}
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 sm:p-5 min-h-[120px] flex items-center justify-between gap-4">
          {latestVisit ? (
            <div className="flex items-center gap-3.5 w-full">
              <div
                className="w-12 h-12 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: latestVisit.avatarColor }}
              >
                {latestVisit.name.slice(-2)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{latestVisit.name}</span>
                  {latestVisit.bought ? (
                    <span className="text-xs font-extrabold font-mono-num text-emerald-700">
                      +{latestVisit.pricePaid.toLocaleString('ko-KR')}원 구매!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600">
                      {latestVisit.reason === 'sold_out' ? '품절!' : '가격 부담'}
                    </span>
                  )}
                </div>
                <div className="bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800">
                  “{latestVisit.comment}”
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-500 w-full text-center">
              손님들이 가게 문을 열고 들어오고 있어요...
            </div>
          )}
        </div>

        {/* Recent Customer Feed Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            지금까지 판매: <strong className="text-slate-900 font-mono-num">{soldSoFar}개</strong>
          </span>
          {(stage === 'morning' || stage === 'afternoon') && (
            <button
              type="button"
              onClick={() => {
                if (stage === 'morning') {
                  setMorningIndex(morningData.visits.length);
                } else {
                  setAfternoonIndex(afternoonData.visits.length);
                }
              }}
              className="inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>빠르게 넘기기</span>
            </button>
          )}
        </div>
      </div>

      {/* Midday Interactive Dilemma Card */}
      {stage === 'event' && (
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700">
            <Sparkles className="w-4 h-4" />
            <span>한낮 돌발 사건 발생!</span>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {dayConfig.middayEvent.title}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>{dayConfig.middayEvent.speaker}:</strong> {dayConfig.middayEvent.dialogue}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {dayConfig.middayEvent.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSelectEventChoice(choice)}
                className="text-left bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 hover:border-slate-900 rounded-2xl p-4 space-y-1.5 transition-all cursor-pointer"
              >
                <div className="text-sm font-extrabold text-slate-900">{choice.label}</div>
                <div className="text-xs text-slate-600 leading-snug">{choice.hint}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End of Day Finish Button */}
      {stage === 'done' && (
        <button
          type="button"
          onClick={() => {
            soundFx.playSuccess();
            handleCompleteDay();
          }}
          className="w-full min-h-[54px] rounded-2xl bg-slate-900 text-white font-extrabold text-base hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm"
        >
          <span>오늘 장부 정산하기</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
