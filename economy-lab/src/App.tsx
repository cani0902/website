import { useState } from 'react';
import { GameMode, GameState, ShopUpgrade } from './game/types';
import { STORY_DAYS } from './game/storyDays';
import {
  INITIAL_GAME_STATE,
  getEffectiveDayFactors,
  settleDayResult,
} from './game/economyLogic';
import { soundFx } from './utils/soundFx';
import { TitleScreen } from './components/TitleScreen';
import { GameHud } from './components/GameHud';
import { DayStoryCard } from './components/DayStoryCard';
import { ShopPrepPanel } from './components/ShopPrepPanel';
import { LiveShopFloor } from './components/LiveShopFloor';
import { DaySummaryCard } from './components/DaySummaryCard';
import { EndingScreen } from './components/EndingScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
    mode: 'story',
    phase: 'TITLE',
  });
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  // Active day selections
  const [todayProduced, setTodayProduced] = useState(0);
  const [todayPrice, setTodayPrice] = useState(2400);

  const currentDayConfig = STORY_DAYS[gameState.day - 1] ?? STORY_DAYS[0];
  const dayFactors = getEffectiveDayFactors(
    currentDayConfig,
    gameState.upgrades,
    gameState.satisfaction,
  );

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundFx.enabled = next;
    setSoundEnabled(next);
    if (next) soundFx.playClick();
  };

  const handleStartGame = (mode: GameMode) => {
    setGameState({
      ...INITIAL_GAME_STATE,
      cash: mode === 'free' ? 30000 : INITIAL_GAME_STATE.cash,
      mode,
      phase: mode === 'story' ? 'DAY_STORY' : 'PREPARE_SHOP',
    });
  };

  const handleDeposit = (amount: number) => {
    setGameState((prev) => {
      if (prev.cash < amount) return prev;
      return { ...prev, cash: prev.cash - amount, savings: prev.savings + amount };
    });
  };

  const handleWithdraw = (amount: number) => {
    setGameState((prev) => {
      if (prev.savings < amount) return prev;
      return { ...prev, cash: prev.cash + amount, savings: prev.savings - amount };
    });
  };

  const handleTakeLoan = () => {
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + 5000,
      loan: prev.loan + 5000,
    }));
  };

  const handleRepayLoan = () => {
    setGameState((prev) => {
      if (prev.loan < 5000 || prev.cash < 5000) return prev;
      return { ...prev, cash: prev.cash - 5000, loan: prev.loan - 5000 };
    });
  };

  const handleBuyUpgrade = (upgrade: ShopUpgrade) => {
    setGameState((prev) => {
      if (prev.upgrades.includes(upgrade.id) || prev.cash < upgrade.cost) return prev;
      return {
        ...prev,
        cash: prev.cash - upgrade.cost,
        upgrades: [...prev.upgrades, upgrade.id],
      };
    });
  };

  const handleOpenShop = (producedQty: number, sellingPrice: number) => {
    setTodayProduced(producedQty);
    setTodayPrice(sellingPrice);
    setGameState((prev) => ({ ...prev, phase: 'OPEN_SHOP_LIVE' }));
  };

  const handleFinishLiveDay = (liveResult: {
    finalProducedQty: number;
    finalSoldQty: number;
    finalSellingPrice: number;
    extraStockCost: number;
    satisfactionDelta: number;
    chosenEventLabel: string;
  }) => {
    const initialProductionCost = todayProduced * dayFactors.unitCost;

    const result = settleDayResult({
      day: gameState.day,
      producedQty: liveResult.finalProducedQty,
      soldQty: liveResult.finalSoldQty,
      sellingPrice: liveResult.finalSellingPrice,
      unitCost: dayFactors.unitCost,
      fairPrice: dayFactors.fairPrice,
      extraStockCost: liveResult.extraStockCost,
      cashBeforePrep: gameState.cash,
      initialProductionCost,
      savings: gameState.savings,
      loan: gameState.loan,
      bankRatePct: currentDayConfig.bankRatePct,
      satisfactionBefore: gameState.satisfaction,
      eventSatisfactionDelta: liveResult.satisfactionDelta,
      chosenEventLabel: liveResult.chosenEventLabel,
    });

    setGameState((prev) => ({
      ...prev,
      cash: Math.max(0, result.endCash),
      savings: result.endSavings,
      satisfaction: result.satisfactionAfter,
      history: [...prev.history, result],
      phase: 'DAY_SUMMARY',
    }));
  };

  const handleNextDay = () => {
    if (gameState.day >= 7) {
      soundFx.playSuccess();
      setGameState((prev) => ({ ...prev, phase: 'FINAL_ENDING' }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      day: prev.day + 1,
      phase: prev.mode === 'story' ? 'DAY_STORY' : 'PREPARE_SHOP',
    }));
  };

  if (gameState.phase === 'TITLE') {
    return <TitleScreen onStartGame={handleStartGame} />;
  }

  const latestSummary = gameState.history[gameState.history.length - 1];

  return (
    <div className="min-h-screen bg-amber-50/35 flex flex-col">
      <GameHud
        state={gameState}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onBackToTitle={() =>
          setGameState({
            ...INITIAL_GAME_STATE,
            mode: 'story',
            phase: 'TITLE',
          })
        }
      />

      <main className="flex-1">
        {gameState.phase === 'DAY_STORY' && (
          <DayStoryCard
            config={currentDayConfig}
            effectiveUnitCost={dayFactors.unitCost}
            onProceed={() =>
              setGameState((prev) => ({ ...prev, phase: 'PREPARE_SHOP' }))
            }
          />
        )}

        {gameState.phase === 'PREPARE_SHOP' && (
          <ShopPrepPanel
            key={`prep-day-${gameState.day}`}
            state={gameState}
            dayConfig={currentDayConfig}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onTakeLoan={handleTakeLoan}
            onRepayLoan={handleRepayLoan}
            onBuyUpgrade={handleBuyUpgrade}
            onOpenShop={handleOpenShop}
          />
        )}

        {gameState.phase === 'OPEN_SHOP_LIVE' && (
          <LiveShopFloor
            dayConfig={currentDayConfig}
            producedQty={todayProduced}
            sellingPrice={todayPrice}
            effectiveDemand={dayFactors.effectiveDemand}
            fairPrice={dayFactors.fairPrice}
            onFinishDay={handleFinishLiveDay}
          />
        )}

        {gameState.phase === 'DAY_SUMMARY' && latestSummary && (
          <DaySummaryCard
            result={latestSummary}
            isFinalDay={gameState.day >= 7}
            onNextDay={handleNextDay}
          />
        )}

        {gameState.phase === 'FINAL_ENDING' && (
          <EndingScreen
            state={gameState}
            onRestart={() =>
              setGameState({
                ...INITIAL_GAME_STATE,
                mode: 'story',
                phase: 'TITLE',
              })
            }
          />
        )}
      </main>
    </div>
  );
}
