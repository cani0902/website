import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Minus,
  PiggyBank,
  Plus,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';
import { DayConfig, GameState, ShopUpgrade } from '../game/types';
import { SHOP_UPGRADES } from '../game/storyDays';
import {
  buildSimpleSupplyDemandData,
  calculateDemandQuantity,
  getEffectiveDayFactors,
  getPriceReactionHint,
} from '../game/economyLogic';
import { soundFx } from '../utils/soundFx';

interface ShopPrepPanelProps {
  state: GameState;
  dayConfig: DayConfig;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onTakeLoan: () => void;
  onRepayLoan: () => void;
  onBuyUpgrade: (upgrade: ShopUpgrade) => void;
  onOpenShop: (producedQty: number, sellingPrice: number) => void;
}

export const ShopPrepPanel: React.FC<ShopPrepPanelProps> = ({
  state,
  dayConfig,
  onDeposit,
  onWithdraw,
  onTakeLoan,
  onRepayLoan,
  onBuyUpgrade,
  onOpenShop,
}) => {
  const { unitCost, fairPrice, effectiveDemand } = useMemo(
    () => getEffectiveDayFactors(dayConfig, state.upgrades, state.satisfaction),
    [dayConfig, state.upgrades, state.satisfaction],
  );

  const maxAffordableQty = Math.min(40, Math.floor(state.cash / unitCost));
  const [producedQty, setProducedQty] = useState<number>(() =>
    Math.max(1, Math.min(maxAffordableQty, Math.min(18, effectiveDemand))),
  );
  const [sellingPrice, setSellingPrice] = useState<number>(fairPrice);
  const [activeTab, setActiveTab] = useState<'shop' | 'bank'>('shop');
  const [showCurveHint, setShowCurveHint] = useState(false);

  // Clamp producedQty whenever cash changes (e.g. after deposit/upgrade)
  const clampedQty = Math.min(producedQty, maxAffordableQty);
  const totalProdCost = clampedQty * unitCost;
  const priceHint = getPriceReactionHint(sellingPrice, fairPrice, unitCost);
  const estimatedBuyers = calculateDemandQuantity(
    sellingPrice,
    effectiveDemand,
    fairPrice,
  );

  const curveData = useMemo(
    () => buildSimpleSupplyDemandData(effectiveDemand, fairPrice, clampedQty),
    [effectiveDemand, fairPrice, clampedQty],
  );

  const loanRate = dayConfig.bankRatePct + 3;

  return (
    <div className="max-w-4xl mx-auto py-5 sm:py-7 px-4 space-y-5">
      {/* Mode Switcher: Shop Prep vs Bank & Upgrades */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-amber-100/80 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('shop');
            }}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-amber-900/70 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>간식 만들기 · 가격 정하기</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('bank');
            }}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bank'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-amber-900/70 hover:text-slate-900'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>올리 은행 · 가게 업그레이드</span>
          </button>
        </div>

        <div className="hidden sm:block text-xs font-semibold text-slate-500">
          오늘 예상 손님 약 <strong className="text-slate-900">{effectiveDemand}명</strong>
        </div>
      </div>

      {activeTab === 'shop' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left: Quantity & Price Interactive Controls */}
          <div className="md:col-span-7 bg-white border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xs">
            {/* 1. Production Quantity (Supply) */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    1. 오늘 몇 개 만들까요? (공급)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    개당 원가 {unitCost.toLocaleString('ko-KR')}원 · 최대 {maxAffordableQty}개 제작 가능
                  </p>
                </div>
                <span className="text-2xl font-extrabold font-mono-num text-sky-700">
                  {clampedQty}개
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setProducedQty(Math.max(0, clampedQty - 1));
                  }}
                  aria-label="수량 1개 줄이기"
                  className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, maxAffordableQty)}
                  step={1}
                  value={clampedQty}
                  onChange={(e) => setProducedQty(parseInt(e.target.value, 10))}
                  className="econ-slider flex-1"
                  style={{
                    background: `linear-gradient(to right, #0284c7 0%, #0284c7 ${
                      maxAffordableQty > 0 ? (clampedQty / maxAffordableQty) * 100 : 0
                    }%, #e2e8f0 ${
                      maxAffordableQty > 0 ? (clampedQty / maxAffordableQty) * 100 : 0
                    }%, #e2e8f0 100%)`,
                    height: '8px',
                    borderRadius: '9999px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setProducedQty(Math.min(maxAffordableQty, clampedQty + 1));
                  }}
                  aria-label="수량 1개 늘리기"
                  className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-semibold text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2 flex justify-between">
                <span>필요한 재료비</span>
                <span className="font-mono-num text-slate-900">
                  {totalProdCost.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. Selling Price */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    2. 1개에 얼마로 팔까요? (가격)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    개당 예상 이익:{' '}
                    <strong className="font-mono-num text-slate-800">
                      {(sellingPrice - unitCost).toLocaleString('ko-KR')}원
                    </strong>
                  </p>
                </div>
                <span className="text-2xl font-extrabold font-mono-num text-rose-600">
                  {sellingPrice.toLocaleString('ko-KR')}원
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSellingPrice(Math.max(1000, sellingPrice - 100));
                  }}
                  aria-label="가격 100원 내리기"
                  className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={1000}
                  max={5000}
                  step={100}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseInt(e.target.value, 10))}
                  className="econ-slider flex-1"
                  style={{
                    background: `linear-gradient(to right, #e11d48 0%, #e11d48 ${
                      ((sellingPrice - 1000) / 4000) * 100
                    }%, #e2e8f0 ${((sellingPrice - 1000) / 4000) * 100}%, #e2e8f0 100%)`,
                    height: '8px',
                    borderRadius: '9999px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSellingPrice(Math.min(5000, sellingPrice + 100));
                  }}
                  aria-label="가격 100원 올리기"
                  className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Customer Reaction Hint */}
              <div
                className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold border ${
                  priceHint.tone === 'loss'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : priceHint.tone === 'hot'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : priceHint.tone === 'good'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {priceHint.label} (예상 구매 손님 약 {estimatedBuyers}명)
              </div>
            </div>

            {/* Optional Demand-Supply Chart Hint Toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowCurveHint((prev) => !prev)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>수요·공급 그래프 힌트 {showCurveHint ? '닫기' : '살짝 보기'}</span>
                {showCurveHint ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showCurveHint && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <div className="text-[11px] text-slate-600">
                    빨간 선(수요)과 파란 선(내가 만든 수량 {clampedQty}개)이 만나는 가격이 균형가격이에요!
                  </div>
                  <div className="w-full h-[170px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={curveData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="priceLabel" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                          formatter={(val, name) => [
                            `${val}개`,
                            name === 'demandQty' ? '사려는 손님 수(수요)' : '내가 만든 개수(공급)',
                          ]}
                        />
                        <ReferenceLine y={clampedQty} stroke="#0284c7" strokeDasharray="4 4" strokeWidth={2} />
                        <Line
                          type="monotone"
                          dataKey="demandQty"
                          stroke="#e11d48"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Daily Preview & Open Shop CTA */}
          <div className="md:col-span-5 bg-white border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">오늘 영업 요약</h3>
              <p className="text-xs text-slate-500">
                준비한 간식이 팔리지 않고 남으면 밤에 상해서 버려져요!
              </p>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">현재 가진 현금</span>
                <span className="font-bold font-mono-num text-slate-900">
                  {state.cash.toLocaleString('ko-KR')}원
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">재료비 지출</span>
                <span className="font-bold font-mono-num text-rose-600">
                  -{totalProdCost.toLocaleString('ko-KR')}원
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">예상 완판 시 매출</span>
                <span className="font-bold font-mono-num text-emerald-700">
                  +{(clampedQty * sellingPrice).toLocaleString('ko-KR')}원
                </span>
              </div>
              {state.savings > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
                  <span className="text-sky-700">오늘 받을 은행 이자 ({dayConfig.bankRatePct}%)</span>
                  <span className="font-bold font-mono-num text-sky-700">
                    +{Math.round(state.savings * (dayConfig.bankRatePct / 100)).toLocaleString('ko-KR')}원
                  </span>
                </div>
              )}
              {state.loan > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-100 text-xs">
                  <span className="text-amber-700">오늘 낼 대출 이자 ({loanRate}%)</span>
                  <span className="font-bold font-mono-num text-amber-700">
                    -{Math.round(state.loan * (loanRate / 100)).toLocaleString('ko-KR')}원
                  </span>
                </div>
              )}
            </div>

            {clampedQty === 0 && maxAffordableQty === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 font-medium">
                현금이 부족해요! ‘올리 은행’ 탭에서 저축을 찾거나 대출을 받아보세요.
              </div>
            )}

            <button
              type="button"
              disabled={clampedQty <= 0}
              onClick={() => {
                soundFx.playCashRegister();
                onOpenShop(clampedQty, sellingPrice);
              }}
              className={`w-full min-h-[54px] rounded-2xl font-extrabold text-base inline-flex items-center justify-center gap-2 transition-all ${
                clampedQty <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] cursor-pointer shadow-sm'
              }`}
            >
              <Store className="w-5 h-5" />
              <span>가게 문 열기! (영업 시작)</span>
            </button>
          </div>
        </div>
      ) : (
        /* TAB 2: Owl Bank & Shop Upgrades */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Owl Banker Card */}
          <div className="bg-white border border-sky-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <img
                src="/src/assets/images/character_owl_banker_1795533144138.jpg"
                alt="올리 은행장"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-sky-200 shrink-0"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">올리의 반짝 은행</h3>
                <p className="text-xs text-sky-700 font-semibold">
                  오늘 예금 금리 {dayConfig.bankRatePct}% · 대출 금리 {loanRate}%
                </p>
              </div>
            </div>

            {/* Savings */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-800">내 예금 통장</span>
                <span className="font-extrabold font-mono-num text-sky-700">
                  {state.savings.toLocaleString('ko-KR')}원
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={state.cash < 3000}
                  onClick={() => {
                    soundFx.playCoin();
                    onDeposit(3000);
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    state.cash < 3000
                      ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100 cursor-pointer'
                  }`}
                >
                  3,000원 저축하기
                </button>
                <button
                  type="button"
                  disabled={state.savings < 3000}
                  onClick={() => {
                    soundFx.playCoin();
                    onWithdraw(3000);
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    state.savings < 3000
                      ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  3,000원 찾기
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Loan */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-800">은행 대출금</span>
                <span className="font-extrabold font-mono-num text-amber-700">
                  {state.loan.toLocaleString('ko-KR')}원
                </span>
              </div>
              <p className="text-xs text-slate-500">
                돈이 모자랄 때 5,000원을 빌릴 수 있지만, 갚을 때까지 매일 {loanRate}%의 이자를 내야 해요.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={state.loan >= 15000}
                  onClick={() => {
                    soundFx.playCoin();
                    onTakeLoan();
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    state.loan >= 15000
                      ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 cursor-pointer'
                  }`}
                >
                  5,000원 대출받기
                </button>
                <button
                  type="button"
                  disabled={state.loan < 5000 || state.cash < 5000}
                  onClick={() => {
                    soundFx.playCoin();
                    onRepayLoan();
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    state.loan < 5000 || state.cash < 5000
                      ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                  }`}
                >
                  5,000원 갚기
                </button>
              </div>
            </div>
          </div>

          {/* Shop Upgrades (Investment) */}
          <div className="bg-white border border-amber-200/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">가게 업그레이드 (투자)</h3>
                <p className="text-xs text-slate-500">
                  한 번 사두면 남은 날 동안 계속 가게 수익이 좋아져요!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {SHOP_UPGRADES.map((upg) => {
                const owned = state.upgrades.includes(upg.id);
                const canBuy = !owned && state.cash >= upg.cost;

                return (
                  <div
                    key={upg.id}
                    className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
                      owned
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50/80 border-slate-200/80'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-extrabold text-slate-900">{upg.name}</div>
                      <div className="text-xs text-slate-600">{upg.description}</div>
                      <div className="text-xs font-bold text-sky-700 pt-0.5">{upg.effectLabel}</div>
                    </div>

                    {owned ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0 px-3 py-2">
                        <Check className="w-4 h-4" />
                        보유 중
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => {
                          soundFx.playCashRegister();
                          onBuyUpgrade(upg);
                        }}
                        className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1 shrink-0 transition-all ${
                          canBuy
                            ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span className="font-mono-num">{upg.cost.toLocaleString('ko-KR')}원</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
