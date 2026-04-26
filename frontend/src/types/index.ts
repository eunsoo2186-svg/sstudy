export interface CompanyInfo {
  name: string;
  ticker: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  marketCap: number;
  per: number;
  pbr: number;
  peg: number;
  psr: number;
  roe: number;
  roa: number;
  debtRatio: number;
  dividendYield: number;
  market: string;
}

export interface SectorInfo {
  major: string;
  middle: string;
  minor: string;
  detail: string;
  trendCategories: string[];
}

export interface ValuationSignal {
  type: string;
  value: number;
  benchmark: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
}

export interface InsiderTrade {
  date: string;
  officer: string;
  amount: number;
  type: 'buy' | 'sell';
}

export interface BullBearCase {
  case: 'bull' | 'bear';
  probability: number;
  points: string[];
  targetPriceChange: number;
}

export interface MacroIndicator {
  name: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  sectorRelevance: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartEvent {
  date: string;
  type: 'earnings' | 'news' | 'product' | 'institution';
  title: string;
  detail: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  events: ChartEvent[];
}

export interface LearningNote {
  id: string;
  companyName: string;
  title: string;
  stage1: string;
  stage2: string;
  stage3: string;
  stage4: string;
  stage5: string;
  tags: string[];
  concepts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  conceptId: string;
  conceptName: string;
  dueDate: string;
  reviewCount: number;
  nextInterval: number;
}

export interface CompetitorInfo {
  name: string;
  ticker: string;
  marketShare: number;
  rdRate: number;
  roa: number;
  debtRatio: number;
  keyAdvantage: string;
}

export interface HotReason {
  type: 'valuation' | 'insider' | 'tech' | 'fundamental' | 'news';
  title: string;
  strength: number;
  keyMetrics: { label: string; value: string }[];
  interpretation: string;
}

export interface AnalysisResult {
  company: CompanyInfo;
  sector: SectorInfo;
  hotReasons: HotReason[];
  valuation: ValuationSignal[];
  chartData: ChartDataPoint[];
  competitors: CompetitorInfo[];
  bullBear: BullBearCase[];
  entryTiming: {
    signal: 'buy' | 'wait' | 'avoid';
    confidence: number;
    supportLevel: number;
    resistanceLevel: number;
    targetPrice: number;
    stopLoss: number;
    reasoning: string;
  };
  macro: MacroIndicator[];
}
