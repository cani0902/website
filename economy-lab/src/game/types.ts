export type GamePhase =
  | 'TITLE'
  | 'DAY_STORY'
  | 'PREPARE_SHOP'
  | 'OPEN_SHOP_LIVE'
  | 'DAY_SUMMARY'
  | 'FINAL_ENDING';

export type GameMode = 'story' | 'free';

export type CharacterId = 'bear' | 'owl';

export interface ShopUpgrade {
  id: 'oven' | 'sign' | 'fridge';
  name: string;
  cost: number;
  description: string;
  effectLabel: string;
}

export interface MiddayChoice {
  id: string;
  label: string;
  hint: string;
  priceAdjust: number;
  extraStock: number;
  stockCost: number;
  satisfactionDelta: number;
  demandBoost: number;
}

export interface MiddayEvent {
  id: string;
  title: string;
  speaker: string;
  dialogue: string;
  choices: MiddayChoice[];
}

export interface DayConfig {
  day: number;
  title: string;
  weatherLabel: string;
  speakerId: CharacterId;
  speakerName: string;
  speakerRole: string;
  storyText: string;
  economicLessonTitle: string;
  economicTip: string;
  baseDemand: number;       // 기본 손님 수 (예: 18)
  fairPrice: number;        // 기준 적정 가격 (예: 2500)
  unitCost: number;         // 개당 재료 원가 (예: 1100)
  bankRatePct: number;      // 오늘의 은행 일일 이자율 (%)
  middayEvent: MiddayEvent;
}

export interface CustomerVisit {
  id: number;
  name: string;
  avatarColor: string;
  bought: boolean;
  reason: 'bought' | 'too_expensive' | 'sold_out';
  pricePaid: number;
  comment: string;
}

export interface DayResult {
  day: number;
  producedQty: number;
  soldQty: number;
  leftoverQty: number;
  sellingPrice: number;
  unitCost: number;
  revenue: number;
  productionCost: number;
  bankInterestEarned: number;
  loanInterestPaid: number;
  netProfit: number;
  endCash: number;
  endSavings: number;
  endLoan: number;
  totalAssets: number;
  satisfactionAfter: number;
  adviceText: string;
  chosenEventLabel: string;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  day: number;
  cash: number;
  savings: number;
  loan: number;
  satisfaction: number; // 0 ~ 100
  upgrades: ('oven' | 'sign' | 'fridge')[];
  history: DayResult[];
}
