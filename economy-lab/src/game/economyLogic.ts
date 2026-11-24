import { CustomerVisit, DayConfig, DayResult, GameState } from './types';

export const INITIAL_GAME_STATE: Omit<GameState, 'mode' | 'phase'> = {
  day: 1,
  cash: 18000,
  savings: 0,
  loan: 0,
  satisfaction: 75,
  upgrades: [],
  history: [],
};

/**
 * 업그레이드 효과를 반영한 오늘의 실제 원가/적정가격/기본수요 계산
 */
export function getEffectiveDayFactors(
  config: DayConfig,
  upgrades: ('oven' | 'sign' | 'fridge')[],
  satisfaction: number,
) {
  const unitCost = upgrades.includes('oven')
    ? Math.max(500, config.unitCost - 250)
    : config.unitCost;

  const fairPrice = upgrades.includes('fridge')
    ? config.fairPrice + 400
    : config.fairPrice;

  const satisfactionBonus = Math.round((satisfaction - 70) / 10);
  const signBonus = upgrades.includes('sign') ? 5 : 0;
  const effectiveDemand = Math.max(8, config.baseDemand + signBonus + satisfactionBonus);

  return { unitCost, fairPrice, effectiveDemand };
}

/**
 * 수요 곡선 계산: 가격에 따라 손님이 실제로 사려는 개수 계산
 */
export function calculateDemandQuantity(
  price: number,
  effectiveDemand: number,
  fairPrice: number,
): number {
  // 가격 탄력성: fairPrice보다 500원 비싸면 수요가 약 25% 감소, 싸면 증가
  const priceDiffRatio = (price - fairPrice) / fairPrice;
  const elasticityFactor = 1 - priceDiffRatio * 1.35;
  const qty = Math.round(effectiveDemand * Math.max(0.1, elasticityFactor));
  return Math.max(0, Math.min(48, qty));
}

/**
 * 가격에 따른 직관적 손님 반응 힌트 (어린이/청소년 눈높이)
 */
export function getPriceReactionHint(
  price: number,
  fairPrice: number,
  unitCost: number,
): { label: string; tone: 'good' | 'hot' | 'high' | 'loss' } {
  if (price <= unitCost) {
    return {
      label: '원가보다 싸거나 같아서 팔수록 손해예요!',
      tone: 'loss',
    };
  }
  if (price <= fairPrice - 400) {
    return {
      label: '완전 저렴해요! 손님들이 금방 몰려올 거예요.',
      tone: 'hot',
    };
  }
  if (price <= fairPrice + 300) {
    return {
      label: '적당하고 알맞은 가격이에요! 수익과 만족도가 균형 잡혀요.',
      tone: 'good',
    };
  }
  return {
    label: '조금 비싼 편이에요. 손님들이 망설일 수 있어요.',
    tone: 'high',
  };
}

/**
 * Recharts용 간단한 수요·공급 힌트 데이터 생성
 */
export function buildSimpleSupplyDemandData(
  effectiveDemand: number,
  fairPrice: number,
  producedQty: number,
) {
  const prices = [1200, 1800, 2400, 3000, 3600, 4200, 4800];
  return prices.map((p) => ({
    priceLabel: `${(p / 1000).toFixed(1)}천`,
    price: p,
    demandQty: calculateDemandQuantity(p, effectiveDemand, fairPrice),
    supplyQty: producedQty,
  }));
}

const CUSTOMER_NAMES = [
  { name: '아기 곰 뭉치', color: '#d97706' },
  { name: '토끼 루비', color: '#e11d48' },
  { name: '다람쥐 토리', color: '#ea580c' },
  { name: '여우 피코', color: '#0284c7' },
  { name: '오소리 보리', color: '#475569' },
  { name: '고양이 나비', color: '#7c3aed' },
];

/**
 * 실시간 영업 장면을 위한 손님 방문 시퀀스 생성
 */
export function generateCustomerVisits(
  producedQty: number,
  sellingPrice: number,
  effectiveDemand: number,
  fairPrice: number,
): { visits: CustomerVisit[]; soldQty: number } {
  const willingBuyers = calculateDemandQuantity(
    sellingPrice,
    effectiveDemand,
    fairPrice,
  );

  // 총 방문객은 사고 싶은 사람 + 가격이 비싸서 구경만 하고 가는 사람
  const totalVisitors = Math.max(willingBuyers, Math.min(34, effectiveDemand + 2));
  const visits: CustomerVisit[] = [];
  let remaining = producedQty;
  let soldQty = 0;

  for (let i = 0; i < totalVisitors; i++) {
    const profile = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
    // 앞쪽 손님과 분산 배치
    const wantsToBuy = i < willingBuyers;

    if (!wantsToBuy) {
      visits.push({
        id: i + 1,
        name: profile.name,
        avatarColor: profile.color,
        bought: false,
        reason: 'too_expensive',
        pricePaid: 0,
        comment: '으음... 가격이 조금 비싸서 다음엔 살게요!',
      });
    } else if (remaining > 0) {
      remaining -= 1;
      soldQty += 1;
      visits.push({
        id: i + 1,
        name: profile.name,
        avatarColor: profile.color,
        bought: true,
        reason: 'bought',
        pricePaid: sellingPrice,
        comment:
          sellingPrice <= fairPrice - 200
            ? `우와 ${sellingPrice.toLocaleString('ko-KR')}원? 완전 싸다!`
            : `맛있겠다! ${sellingPrice.toLocaleString('ko-KR')}원 여기요!`,
      });
    } else {
      visits.push({
        id: i + 1,
        name: profile.name,
        avatarColor: profile.color,
        bought: false,
        reason: 'sold_out',
        pricePaid: 0,
        comment: '앗! 벌써 다 팔려버렸네... 아쉬워요!',
      });
    }
  }

  return { visits, soldQty };
}

/**
 * 하루 영업 종료 후 정산 및 맞춤형 경제 조언 생성
 */
export function settleDayResult(params: {
  day: number;
  producedQty: number;
  soldQty: number;
  sellingPrice: number;
  unitCost: number;
  fairPrice: number;
  extraStockCost: number;
  cashBeforePrep: number;
  initialProductionCost: number;
  savings: number;
  loan: number;
  bankRatePct: number;
  satisfactionBefore: number;
  eventSatisfactionDelta: number;
  chosenEventLabel: string;
}): DayResult {
  const {
    day,
    producedQty,
    soldQty,
    sellingPrice,
    unitCost,
    fairPrice,
    extraStockCost,
    cashBeforePrep,
    initialProductionCost,
    savings,
    loan,
    bankRatePct,
    satisfactionBefore,
    eventSatisfactionDelta,
    chosenEventLabel,
  } = params;

  const leftoverQty = Math.max(0, producedQty - soldQty);
  const revenue = soldQty * sellingPrice;
  const totalProductionCost = initialProductionCost + extraStockCost;

  // 은행 이자: 일일 단위로 체감되도록 설정된 bankRatePct% 적용
  const bankInterestEarned = Math.round((savings * (bankRatePct / 100)) / 10) * 10;
  // 대출 이자는 예금 이자율 + 3%p (은행 마진 체험!)
  const loanRate = bankRatePct + 3;
  const loanInterestPaid = Math.round((loan * (loanRate / 100)) / 10) * 10;

  const endSavings = savings + bankInterestEarned;
  const endCash = cashBeforePrep - totalProductionCost + revenue - loanInterestPaid;
  const netProfit = revenue - totalProductionCost + bankInterestEarned - loanInterestPaid;
  const totalAssets = endCash + endSavings - loan;

  // 만족도 변화 계산
  let satDelta = eventSatisfactionDelta;
  if (sellingPrice <= fairPrice) satDelta += 3;
  else if (sellingPrice > fairPrice + 500) satDelta -= 5;
  if (leftoverQty === 0 && soldQty > 0 && producedQty < 12) satDelta -= 2; // 너무 빨리 품절
  const satisfactionAfter = Math.max(10, Math.min(100, satisfactionBefore + satDelta));

  // 맞춤형 조언 생성
  let adviceText = '';
  if (netProfit < 0) {
    adviceText =
      '오늘은 재료비나 이자 지출이 매출보다 많았어요. 판매 가격을 원가보다 충분히 높게 잡고, 남는 재고를 줄여보세요!';
  } else if (leftoverQty >= 6) {
    adviceText = `준비한 물건 중 ${leftoverQty}개가 남았어요. 가격을 조금 낮추거나 생산 개수를 줄이면 재료비를 아낄 수 있어요!`;
  } else if (leftoverQty === 0 && soldQty >= 15) {
    adviceText =
      '준비한 물건이 모두 완판되었어요! 손님 수요가 아주 좋으니 내일은 몇 개 더 만들어도 좋겠어요.';
  } else if (bankInterestEarned >= 300) {
    adviceText = `은행 예금으로 ${bankInterestEarned.toLocaleString('ko-KR')}원의 이자 수익을 챙겼어요! 돈이 일을 하게 만든 멋진 선택이에요.`;
  } else {
    adviceText =
      '수요와 공급의 균형이 아주 좋았어요! 적당한 가격 덕분에 수익과 손님 만족도를 모두 지켰습니다.';
  }

  return {
    day,
    producedQty,
    soldQty,
    leftoverQty,
    sellingPrice,
    unitCost,
    revenue,
    productionCost: totalProductionCost,
    bankInterestEarned,
    loanInterestPaid,
    netProfit,
    endCash,
    endSavings,
    endLoan: loan,
    totalAssets,
    satisfactionAfter,
    adviceText,
    chosenEventLabel,
  };
}

/**
 * 7일 모험 최종 엔딩 평가
 */
export function evaluateGameEnding(state: GameState): {
  title: string;
  badgeLabel: string;
  endingNarrative: string;
  totalAssets: number;
  totalProfit: number;
  grade: 'S' | 'A' | 'B' | 'C';
} {
  const totalAssets = state.cash + state.savings - state.loan;
  const totalProfit = state.history.reduce((sum, d) => sum + d.netProfit, 0);

  if (totalAssets >= 48000 && state.satisfaction >= 80) {
    return {
      title: '전설의 별빛 상점 마스터',
      badgeLabel: 'S등급 · 최고 사장님',
      endingNarrative:
        '“와! 일주일 만에 가게를 이렇게 크게 키우고 마을 사람들까지 행복하게 만들다니, 넌 진짜 타고난 경제 천재구나!”',
      totalAssets,
      totalProfit,
      grade: 'S',
    };
  }
  if (state.savings >= 15000 && totalAssets >= 35000) {
    return {
      title: '똑똑한 금리 & 저축왕',
      badgeLabel: 'A등급 · 금융 전략가',
      endingNarrative:
        '“장사로 번 돈을 허투루 쓰지 않고 은행 이자까지 알뜰하게 챙겼구나! 돈의 흐름을 읽는 눈이 아주 훌륭해!”',
      totalAssets,
      totalProfit,
      grade: 'A',
    };
  }
  if (state.satisfaction >= 85) {
    return {
      title: '모두가 사랑하는 골목 대장',
      badgeLabel: 'A등급 · 인기 만점 사장님',
      endingNarrative:
        '“마을 사람들이 전부 네 이야기만 하더라! 손님들의 마음을 얻는 것이야말로 가장 큰 재산이란다.”',
      totalAssets,
      totalProfit,
      grade: 'A',
    };
  }
  if (totalAssets >= 25000) {
    return {
      title: '든든한 별빛 상점 후계자',
      badgeLabel: 'B등급 · 성실한 사장님',
      endingNarrative:
        '“위기도 있었지만 끝까지 가게를 잘 지켜냈구나! 수요와 공급을 조절하며 한 뼘 더 성장한 멋진 일주일이었어.”',
      totalAssets,
      totalProfit,
      grade: 'B',
    };
  }
  return {
    title: '용감한 새내기 경제 탐험가',
    badgeLabel: 'C등급 · 성장하는 도전자',
    endingNarrative:
      '“비록 코인은 조금 부족했지만 원가와 가격, 이자의 무서움을 직접 부딪혀 배웠으니 다음엔 훨씬 잘할 수 있을 거야!”',
    totalAssets,
    totalProfit,
    grade: 'C',
  };
}
