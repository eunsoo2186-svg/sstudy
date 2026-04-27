import { useState, useEffect, useCallback, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Bar,
} from 'recharts';
import {
  Search, Star, Trash2, TrendingUp, TrendingDown, Minus,
  ChevronRight, ChevronDown, BookOpen, BarChart2,
  MapPin, List, Plus, Clock, RefreshCw, AlertCircle,
} from 'lucide-react';
import { searchCompany, getNotes, getReviewSchedule } from './api/client';
import type {
  AnalysisResult, LearningNote, ReviewItem,
  CompanyInfo, HotReason, ValuationSignal,
} from './types';
import './App.css';

// ── Local types ──────────────────────────────────────────────────────────────

type Tab = '리포트' | '매크로' | '섹터맵' | '학습' | '워치리스트';

interface WatchlistItem {
  name: string;
  ticker: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  market: string;
}

interface KoreanMacroItem {
  name: string;
  displayValue: string;
  trend: 'up' | 'down' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  sectorRelevance: string;
}

interface SectorNode {
  name: string;
  ticker?: string;
  children?: SectorNode[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const KOREAN_MACRO: KoreanMacroItem[] = [
  { name: '한국은행 기준금리', displayValue: '3.25%', trend: 'stable', impact: 'neutral', description: '동결 기조 유지. 하반기 인하 기능성 논의 중.', sectorRelevance: '부동산·금융 섹터 영향' },
  { name: '원/달러 환율', displayValue: '1,280원', trend: 'down', impact: 'positive', description: '원화 강세 전환. 수입물가 안정 기대.', sectorRelevance: '수출 기업 마진 영향' },
  { name: 'KOSPI 지수', displayValue: '2,650p', trend: 'up', impact: 'positive', description: '외국인 순매수 지속으로 상승 모멘텀 유지.', sectorRelevance: '시장 전반 심리 지표' },
  { name: 'KOSDAQ 지수', displayValue: '940p', trend: 'up', impact: 'positive', description: '바이오·IT 종목 주도로 강세.', sectorRelevance: '성장주·소형주 심리' },
  { name: 'CPI (소비자물가)', displayValue: '2.8%', trend: 'down', impact: 'positive', description: '목표 수준(2%) 근접. 금리 인하 여지 확대.', sectorRelevance: '통화정책 방향성' },
  { name: 'GDP 성장률', displayValue: '2.1%', trend: 'stable', impact: 'neutral', description: '수출 회복 견인. 내수 회복은 더딘 편.', sectorRelevance: '경기 사이클 판단' },
  { name: '실업률', displayValue: '2.9%', trend: 'stable', impact: 'positive', description: '완전고용 수준 유지. 소비 여력 견고.', sectorRelevance: '소비재 섹터 영향' },
  { name: '외국인 순매수', displayValue: '+3,500억', trend: 'up', impact: 'positive', description: '반도체·자동차 중심 외국인 매수세 유입.', sectorRelevance: '시장 수급 핵심 지표' },
];

const SECTOR_TREE: SectorNode[] = [
  {
    name: 'IT / 기술',
    children: [
      {
        name: '반도체', children: [
          { name: '메모리', children: [{ name: 'SK하이닉스', ticker: '000660' }, { name: '삼성전자', ticker: '005930' }] },
          { name: '시스템반도체', children: [{ name: '삼성전자', ticker: '005930' }] },
          { name: '반도체장비·소재', children: [{ name: '동부', ticker: '005260' }] },
        ],
      },
      { name: '디스플레이', children: [{ name: 'LG디스플레이', ticker: '034220' }] },
      { name: 'IT서비스', children: [{ name: '카카오', ticker: '035720' }, { name: '네이버', ticker: '035420' }, { name: '쿠팡', ticker: 'CPNG' }] },
      { name: '전자', children: [{ name: '삼성전자', ticker: '005930' }, { name: 'LG전자', ticker: '066570' }] },
    ],
  },
  {
    name: '자동차',
    children: [
      { name: '완성차', children: [{ name: '현대차', ticker: '005380' }, { name: '기아', ticker: '000270' }] },
      { name: '자동차부품', children: [{ name: '현대모비스', ticker: '012330' }, { name: '만도', ticker: '204320' }] },
      { name: '배터리', children: [{ name: '삼성SDI', ticker: '006400' }, { name: 'LG에너지솔루션', ticker: '373220' }, { name: 'SK이노베이션', ticker: '096770' }] },
    ],
  },
  {
    name: '에너지 / 유틸리티',
    children: [
      { name: '전력', children: [{ name: '한전', ticker: '015760' }] },
      { name: '가스', children: [{ name: '한국가스공사', ticker: '036460' }] },
      { name: '신재생에너지', children: [{ name: '두산에너빌리티', ticker: '034020' }] },
    ],
  },
  {
    name: '금융',
    children: [
      { name: '은행', children: [{ name: 'KB금융', ticker: '105560' }, { name: '우리금융', ticker: '316140' }, { name: '신한지주', ticker: '055550' }, { name: '하나금융지주', ticker: '086790' }] },
      { name: '보험', children: [{ name: '삼성화재', ticker: '000810' }, { name: '한화생명', ticker: '088350' }] },
      { name: '증권', children: [{ name: '삼성증권', ticker: '016360' }] },
    ],
  },
  {
    name: '헬스케어 / 바이오',
    children: [
      { name: '의약', children: [{ name: '셀트리온', ticker: '068270' }, { name: '유한양행', ticker: '000100' }] },
      { name: '바이오', children: [{ name: '삼성바이오로직스', ticker: '207940' }] },
      { name: '의료기기', children: [{ name: '오스템임플란트', ticker: '048260' }] },
    ],
  },
  {
    name: '화학 / 소재',
    children: [
      { name: '화학', children: [{ name: '롯데케미칼', ticker: '011170' }, { name: 'LG화학', ticker: '051910' }] },
      { name: '철강', children: [{ name: 'POSCO홀딩스', ticker: '005490' }, { name: '현대제철', ticker: '004020' }] },
    ],
  },
  {
    name: '소비재',
    children: [
      { name: '식품', children: [{ name: '농심', ticker: '004370' }, { name: 'CJ제일제당', ticker: '097950' }] },
      { name: '음료', children: [{ name: '롯데칠성음료', ticker: '005300' }] },
      { name: '임의소비재', children: [{ name: '현대백화점', ticker: '069960' }] },
    ],
  },
  {
    name: '통신',
    children: [
      { name: '통신서비스', children: [{ name: 'SK텔레콤', ticker: '017670' }, { name: 'KT', ticker: '030200' }, { name: 'LG유플러스', ticker: '032640' }] },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function formatMarketCap(marketCap: number): string {
  const jo = 1_000_000_000_000;
  if (marketCap >= jo) {
    return Math.round(marketCap / jo).toLocaleString('ko-KR') + '조원';
  }
  const eok = 100_000_000;
  return Math.round(marketCap / eok).toLocaleString('ko-KR') + '억원';
}

function signalColor(signal: 'bullish' | 'bearish' | 'neutral'): string {
  if (signal === 'bullish') return 'text-green-400';
  if (signal === 'bearish') return 'text-red-400';
  return 'text-gray-400';
}

function signalBg(signal: 'bullish' | 'bearish' | 'neutral'): string {
  if (signal === 'bullish') return 'bg-green-900/30 border-green-700/40';
  if (signal === 'bearish') return 'bg-red-900/30 border-red-700/40';
  return 'bg-gray-800 border-gray-700';
}

function signalLabel(signal: 'bullish' | 'bearish' | 'neutral'): string {
  if (signal === 'bullish') return '저평가 ▼';
  if (signal === 'bearish') return '고평가 ▲';
  return '중립 ─';
}

function hotReasonIcon(type: HotReason['type']): string {
  const icons = { valuation: '💰', insider: '👤', tech: '🔬', fundamental: '📊', news: '📰' };
  return icons[type];
}

function entrySignalStyle(signal: string): string {
  if (signal === 'buy') return 'bg-green-500/20 text-green-300 border-green-500/40';
  if (signal === 'avoid') return 'bg-red-500/20 text-red-300 border-red-500/40';
  return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
}

function entrySignalText(signal: string): string {
  if (signal === 'buy') return '매수 적기';
  if (signal === 'avoid') return '매수 회피';
  return '관망';
}

// ── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipPayload {
  value: number;
  name: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-white">
          {entry.name === 'close' ? `종가: ${formatPrice(entry.value)}` :
            entry.name === 'volume' ? `거래량: ${(entry.value / 1_000_000).toFixed(1)}M` :
              `${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
}

// ── PriceChart ───────────────────────────────────────────────────────────────

interface PriceChartProps {
  result: AnalysisResult;
}

function PriceChart({ result }: PriceChartProps) {
  const { chartData, entryTiming } = result;
  const eventPoints = chartData.flatMap(d =>
    d.events.map(e => ({ date: d.date, impact: e.impact, title: e.title }))
  );

  const tickFormatter = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(0) + 'k';
    return String(v);
  };

  const priceFormatter = (v: number) => (v / 1000).toFixed(0) + 'K';

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickFormatter={(v: string) => v.slice(5)}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickFormatter={priceFormatter}
            width={45}
          />
          <YAxis
            yAxisId="volume"
            orientation="left"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickFormatter={tickFormatter}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar yAxisId="volume" dataKey="volume" fill="#374151" opacity={0.5} />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#6366F1"
            fill="#6366F120"
            strokeWidth={2}
            dot={false}
          />
          <ReferenceLine
            yAxisId="price"
            y={entryTiming.supportLevel}
            stroke="#22C55E"
            strokeDasharray="4 4"
            label={{ value: '지지', fill: '#22C55E', fontSize: 10 }}
          />
          <ReferenceLine
            yAxisId="price"
            y={entryTiming.resistanceLevel}
            stroke="#EF4444"
            strokeDasharray="4 4"
            label={{ value: '저항', fill: '#EF4444', fontSize: 10 }}
          />
          {eventPoints.map((ep, i) => (
            <ReferenceLine
              key={i}
              yAxisId="price"
              x={ep.date}
              stroke={ep.impact === 'positive' ? '#22C55E' : ep.impact === 'negative' ? '#EF4444' : '#9CA3AF'}
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-2 px-2">
        {chartData.flatMap(d => d.events).slice(0, 5).map((e, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              e.impact === 'positive' ? 'bg-green-900/30 text-green-400' :
                e.impact === 'negative' ? 'bg-red-900/30 text-red-400' :
                  'bg-gray-800 text-gray-400'
            }`}
          >
            <span>{e.impact === 'positive' ? '▲' : e.impact === 'negative' ? '▼' : '─'}</span>
            <span>{e.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HotReasonCard ────────────────────────────────────────────────────────────

interface HotReasonCardProps {
  reason: HotReason;
}

function HotReasonCard({ reason }: HotReasonCardProps) {
  const [expanded, setExpanded] = useState(false);
  const strengthColor = reason.strength >= 75 ? 'bg-green-500' : reason.strength >= 50 ? 'bg-yellow-500' : 'bg-gray-500';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{hotReasonIcon(reason.type)}</span>
          <div>
            <p className="font-semibold text-sm text-white">{reason.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-20 bg-gray-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full strength-bar ${strengthColor}`} style={{ width: `${reason.strength}%` }} />
              </div>
              <span className="text-xs text-gray-400">강도 {reason.strength}%</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-gray-400 hover:text-white transition-colors mt-0.5"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2">
          {reason.keyMetrics.map((m, i) => (
            <div key={i} className="flex justify-between text-xs bg-gray-900/50 rounded px-3 py-2">
              <span className="text-gray-400">{m.label}</span>
              <span className="text-white font-medium">{m.value}</span>
            </div>
          ))}
          <p className="text-xs text-gray-300 leading-relaxed bg-indigo-900/20 border border-indigo-700/30 rounded px-3 py-2 mt-2">
            {reason.interpretation}
          </p>
        </div>
      )}
    </div>
  );
}

// ── ValuationCard ────────────────────────────────────────────────────────────

interface ValuationCardProps {
  v: ValuationSignal;
}

function ValuationCard({ v }: ValuationCardProps) {
  return (
    <div className={`border rounded-xl p-4 ${signalBg(v.signal)}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{v.type}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          v.signal === 'bullish' ? 'bg-green-900/50 text-green-300' :
            v.signal === 'bearish' ? 'bg-red-900/50 text-red-300' :
              'bg-gray-700 text-gray-300'
        }`}>
          {signalLabel(v.signal)}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className={`text-2xl font-bold ${signalColor(v.signal)}`}>{v.value.toFixed(1)}</span>
        <span className="text-xs text-gray-500 mb-1">vs 벤치 {v.benchmark.toFixed(1)}</span>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{v.description}</p>
    </div>
  );
}

// ── CompetitorTable ──────────────────────────────────────────────────────────

interface CompetitorTableProps {
  competitors: AnalysisResult['competitors'];
  currentTicker: string;
}

function CompetitorTable({ competitors, currentTicker }: CompetitorTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left text-gray-400 py-2 pr-4 font-medium">기업</th>
            <th className="text-right text-gray-400 py-2 px-3 font-medium">시장점유율</th>
            <th className="text-right text-gray-400 py-2 px-3 font-medium">R&D율</th>
            <th className="text-right text-gray-400 py-2 px-3 font-medium">ROA</th>
            <th className="text-right text-gray-400 py-2 px-3 font-medium">부채비율</th>
            <th className="text-left text-gray-400 py-2 pl-3 font-medium">핵심강점</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, i) => (
            <tr
              key={i}
              className={`border-b border-gray-800 ${c.ticker === currentTicker ? 'bg-indigo-900/20' : 'hover:bg-gray-800/50'}`}
            >
              <td className="py-2.5 pr-4">
                <span className={`font-medium ${c.ticker === currentTicker ? 'text-indigo-300' : 'text-white'}`}>{c.name}</span>
                <span className="text-gray-500 text-xs ml-1">{c.ticker}</span>
                {c.ticker === currentTicker && <span className="ml-1 text-xs text-indigo-400">★</span>}
              </td>
              <td className="text-right py-2.5 px-3 text-white">{c.marketShare}%</td>
              <td className="text-right py-2.5 px-3 text-white">{c.rdRate}%</td>
              <td className="text-right py-2.5 px-3 text-white">{c.roa}%</td>
              <td className="text-right py-2.5 px-3 text-white">{c.debtRatio}%</td>
              <td className="text-left py-2.5 pl-3 text-gray-300 text-xs">{c.keyAdvantage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── SectorTreeNode ───────────────────────────────────────────────────────────

interface SectorNodeProps {
  node: SectorNode;
  depth: number;
  onCompanyClick: (name: string) => void;
}

function SectorTreeNode({ node, depth, onCompanyClick }: SectorNodeProps) {
  const [open, setOpen] = useState(depth === 0);
  const isLeaf = !node.children || node.children.length === 0;
  const isCompany = !!node.ticker;

  if (isCompany) {
    return (
      <div
        className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-indigo-900/30 cursor-pointer group transition-colors ml-4"
        onClick={() => onCompanyClick(node.name)}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
        <span className="text-sm text-gray-300 group-hover:text-indigo-300 transition-colors">{node.name}</span>
        <span className="text-xs text-gray-600 group-hover:text-gray-400">{node.ticker}</span>
        <ChevronRight size={12} className="ml-auto text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  const depthStyles = [
    'text-base font-bold text-white',
    'text-sm font-semibold text-gray-200',
    'text-sm font-medium text-gray-300',
  ];

  return (
    <div className={depth > 0 ? 'ml-3 border-l border-gray-800 pl-2' : ''}>
      {!isLeaf && (
        <button
          className="flex items-center gap-2 py-2 px-2 w-full text-left hover:bg-gray-800/60 rounded-lg transition-colors"
          onClick={() => setOpen(v => !v)}
        >
          {open ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
          <span className={depthStyles[Math.min(depth, 2)]}>{node.name}</span>
        </button>
      )}
      {open && node.children && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child, i) => (
            <SectorTreeNode key={i} node={child} depth={depth + 1} onCompanyClick={onCompanyClick} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── SectorMapTab ─────────────────────────────────────────────────────────────

function SectorMapTab({ onCompanyClick }: { onCompanyClick: (name: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <MapPin size={20} className="text-indigo-400" />
          한국 증시 섹터맵
        </h2>
        <p className="text-sm text-gray-400">종목을 클릭하면 리포트 탭에서 분석 결과를 확인할 수 있습니다.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTOR_TREE.map((sector, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
            <SectorTreeNode node={sector} depth={0} onCompanyClick={onCompanyClick} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MacroTab ─────────────────────────────────────────────────────────────────

function MacroTab() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <BarChart2 size={20} className="text-indigo-400" />
          한국 거시경제 지표
        </h2>
        <p className="text-sm text-gray-400">주요 경제 지표와 시장에 미치는 영향을 분석합니다.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KOREAN_MACRO.map((item, i) => {
          const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
          const trendColor = item.impact === 'positive'
            ? (item.trend === 'up' ? 'text-green-400' : 'text-red-400')
            : item.impact === 'negative'
              ? (item.trend === 'up' ? 'text-red-400' : 'text-green-400')
              : 'text-gray-400';
          const bgColor = item.impact === 'positive' ? 'bg-green-900/20 border-green-700/30' :
            item.impact === 'negative' ? 'bg-red-900/20 border-red-700/30' :
              'bg-gray-900 border-gray-700';
          return (
            <div key={i} className={`border rounded-2xl p-4 ${bgColor}`}>
              <p className="text-xs text-gray-400 font-medium mb-2">{item.name}</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-white">{item.displayValue}</span>
                <TrendIcon size={18} className={`mb-1 ${trendColor}`} />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.description}</p>
              <div className="border-t border-gray-700/50 pt-2">
                <span className="text-xs text-indigo-400">📌 {item.sectorRelevance}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">📈 매크로 환경 종합 평가</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
            <p className="text-xs text-green-400 font-bold mb-2">긍정 요인</p>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• KOSPI·KOSDAQ 동반 상승세</li>
              <li>• 외국인 순매수 지속</li>
              <li>• CPI 하락으로 금리 인하 기대</li>
              <li>• 완전고용으로 소비 여력 유지</li>
            </ul>
          </div>
          <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
            <p className="text-xs text-red-400 font-bold mb-2">부정 요인</p>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• 기준금리 3.25% 고금리 지속</li>
              <li>• 내수 소비 회복 더딤</li>
              <li>• 글로벌 지정학적 리스크</li>
              <li>• 가계부채 부담 지속</li>
            </ul>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-bold mb-2">중립/관찰</p>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• 환율 1,280원대 안정</li>
              <li>• GDP 성장률 2.1% 유지</li>
              <li>• 정부 밸류업 프로그램 추진</li>
              <li>• 반도체 업황 회복 모멘텀</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LearningTab ──────────────────────────────────────────────────────────────

const LEARNING_STAGES = [
  { stage: '단계 1', title: '기업 이해', desc: '사업 모델, 주요 제품/서비스, 경쟁 포지션 파악. "이 회사는 무엇으로 돈을 버는가?"', icon: '🏢' },
  { stage: '단계 2', title: '밸류에이션', desc: 'PER·PBR·PEG·ROE 등 핵심 지표 분석. "이 주식은 비싼가, 싼가?"', icon: '💰' },
  { stage: '단계 3', title: '매크로 연결', desc: '금리·환율·산업 사이클과 기업 연결. "지금 외부 환경이 이 기업에 어떤 영향을 주는가?"', icon: '🌍' },
  { stage: '단계 4', title: '리스크 분석', desc: '규제·경쟁·재무 리스크 파악. "무엇이 잘못될 수 있는가?"', icon: '⚠️' },
  { stage: '단계 5', title: '매매 전략', desc: '진입가·목표가·손절가 설정. "언제 사고, 얼마에 팔 것인가?"', icon: '📈' },
];

interface LearningTabProps {
  notes: LearningNote[];
  reviewItems: ReviewItem[];
  isLoadingNotes: boolean;
}

function LearningTab({ notes, reviewItems, isLoadingNotes }: LearningTabProps) {
  const [openStage, setOpenStage] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<LearningNote | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const dueToday = reviewItems.filter(r => r.dueDate <= today);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Learning stages */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-indigo-400" />
          5단계 주식 학습법
        </h2>
        <div className="space-y-2">
          {LEARNING_STAGES.map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-800/50 transition-colors"
                onClick={() => setOpenStage(openStage === i ? null : i)}
              >
                <span className="text-xl">{s.icon}</span>
                <div className="text-left">
                  <span className="text-xs text-indigo-400 font-medium">{s.stage}</span>
                  <p className="text-sm font-semibold text-white">{s.title}</p>
                </div>
                {openStage === i ? <ChevronDown size={16} className="ml-auto text-gray-400" /> : <ChevronRight size={16} className="ml-auto text-gray-400" />}
              </button>
              {openStage === i && (
                <div className="px-5 pb-4 bg-indigo-900/10 border-t border-gray-800">
                  <p className="text-sm text-gray-300 leading-relaxed pt-3">{s.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review schedule */}
      {reviewItems.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" />
            복습 스케줄
            {dueToday.length > 0 && (
              <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                오늘 복습 {dueToday.length}개
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reviewItems.map((r, i) => {
              const isDue = r.dueDate <= today;
              return (
                <div key={i} className={`border rounded-xl p-4 flex items-center gap-3 ${isDue ? 'bg-yellow-900/20 border-yellow-700/40' : 'bg-gray-900 border-gray-800'}`}>
                  <RefreshCw size={16} className={isDue ? 'text-yellow-400' : 'text-gray-500'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.conceptName}</p>
                    <p className="text-xs text-gray-400">복습 횟수: {r.reviewCount}회 | 다음 주기: {r.nextInterval}일</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-medium ${isDue ? 'text-yellow-300' : 'text-gray-400'}`}>
                      {isDue ? '오늘 복습' : r.dueDate}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <List size={16} className="text-indigo-400" />
            학습 노트 ({notes.length})
          </h3>
          <button className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13} />
            노트 추가
          </button>
        </div>
        {isLoadingNotes ? (
          <div className="text-center py-8 text-gray-400">노트 불러오는 중...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p>아직 학습 노트가 없습니다.</p>
            <p className="text-xs mt-1">리포트 분석 후 노트를 작성해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-600 transition-colors"
                onClick={() => setSelectedNote(selectedNote?.id === note.id ? null : note)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs text-indigo-400 font-medium">{note.companyName}</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{note.title}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{note.updatedAt}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {note.tags.map((tag, j) => (
                    <span key={j} className="text-xs bg-indigo-900/30 text-indigo-300 border border-indigo-700/30 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                {selectedNote?.id === note.id && (
                  <div className="mt-3 space-y-2 border-t border-gray-700 pt-3">
                    {[
                      { label: '기업 이해', val: note.stage1 },
                      { label: '밸류에이션', val: note.stage2 },
                      { label: '매크로', val: note.stage3 },
                      { label: '리스크', val: note.stage4 },
                      { label: '매매전략', val: note.stage5 },
                    ].map((s, j) => (
                      <div key={j} className="text-xs">
                        <span className="text-indigo-400 font-medium">[{s.label}]</span>
                        <span className="text-gray-300 ml-2">{s.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── WatchlistTab ─────────────────────────────────────────────────────────────

interface WatchlistTabProps {
  watchlist: WatchlistItem[];
  onRemove: (ticker: string) => void;
  onSelect: (name: string) => void;
}

function WatchlistTab({ watchlist, onRemove, onSelect }: WatchlistTabProps) {
  if (watchlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Star size={48} className="mx-auto mb-4 text-gray-700" />
        <p className="text-gray-400 text-lg font-medium">관심 종목이 없습니다.</p>
        <p className="text-gray-500 text-sm mt-2">리포트 탭에서 ★ 버튼을 눌러 추가하세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Star size={20} className="text-yellow-400" />
        워치리스트 ({watchlist.length})
      </h2>
      <div className="space-y-3">
        {watchlist.map((item, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors"
          >
            <button
              className="flex-1 text-left"
              onClick={() => onSelect(item.name)}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-base font-bold text-white">{item.name}</span>
                <span className="text-xs text-gray-500">{item.ticker}</span>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{item.market}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-white">{formatPrice(item.price)}</span>
                <span className={`text-sm font-medium flex items-center gap-0.5 ${item.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.priceChange >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {item.priceChange >= 0 ? '+' : ''}{item.priceChange.toLocaleString('ko-KR')}원
                  ({item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </button>
            <button
              onClick={() => onRemove(item.ticker)}
              className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
              title="워치리스트에서 제거"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ReportTab ─────────────────────────────────────────────────────────────────

interface ReportTabProps {
  result: AnalysisResult | undefined;
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  watchlist: WatchlistItem[];
  onAddToWatchlist: (company: CompanyInfo) => void;
  onRemoveFromWatchlist: (ticker: string) => void;
}

function ReportTab({
  result, isLoading, isError, searchQuery,
  watchlist, onAddToWatchlist, onRemoveFromWatchlist,
}: ReportTabProps) {
  const inWatchlist = result ? watchlist.some(w => w.ticker === result.company.ticker) : false;

  if (!searchQuery) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">📊</div>
        <h2 className="text-2xl font-bold text-white mb-3">한국 주식 심층 분석</h2>
        <p className="text-gray-400 mb-6">상단 검색창에서 분석하고 싶은 기업을 검색하세요</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['SK하이닉스', '삼성전자', '현대차', '셀트리온', 'LG에너지솔루션', 'KB금융'].map(name => (
            <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-default hover:border-indigo-700 hover:text-indigo-300 transition-colors">
              {name}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">위 예시 종목들이 모두 지원됩니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">'{searchQuery}' 분석 중...</p>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
        <p className="text-gray-300">분석 데이터를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const { company, sector, hotReasons, valuation, competitors, bullBear, entryTiming } = result;
  const bullCase = bullBear.find(b => b.case === 'bull');
  const bearCase = bullBear.find(b => b.case === 'bear');
  const forwardPer = valuation.find(v => v.type === 'Forward PER');
  const perVal = valuation.find(v => v.type === 'PER');
  const pegVal = valuation.find(v => v.type === 'PEG');

  const priceColor = company.priceChange >= 0 ? 'text-green-400' : 'text-red-400';
  const priceSign = company.priceChange >= 0 ? '+' : '';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Company header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <span className="text-sm text-gray-400 bg-gray-800 px-2 py-0.5 rounded font-mono">{company.ticker}</span>
              <span className="text-xs text-indigo-300 bg-indigo-900/30 border border-indigo-700/30 px-2 py-0.5 rounded">{company.market}</span>
            </div>
            <p className="text-sm text-gray-400">
              {sector.major} &rsaquo; {sector.middle} &rsaquo; {sector.minor} &rsaquo; <span className="text-indigo-400">{sector.detail}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {sector.trendCategories.map((t, i) => (
                <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{formatPrice(company.price)}</p>
              <p className={`text-sm font-medium ${priceColor}`}>
                {priceSign}{company.priceChange.toLocaleString('ko-KR')}원 ({priceSign}{company.priceChangePercent.toFixed(2)}%)
              </p>
              <p className="text-xs text-gray-500 mt-1">시총 {formatMarketCap(company.marketCap)}</p>
            </div>
            <button
              onClick={() => inWatchlist ? onRemoveFromWatchlist(company.ticker) : onAddToWatchlist(company)}
              className={`p-2.5 rounded-xl border transition-colors ${
                inWatchlist
                  ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-yellow-500/40 hover:text-yellow-400'
              }`}
              title={inWatchlist ? '워치리스트에서 제거' : '워치리스트에 추가'}
            >
              <Star size={18} fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {[
          { label: 'PER', value: `${company.per.toFixed(1)}x` },
          { label: 'Forward PER', value: forwardPer ? `${forwardPer.value.toFixed(1)}x` : `${(company.per * 0.75).toFixed(1)}x` },
          { label: 'PBR', value: `${company.pbr.toFixed(2)}x` },
          { label: 'PEG', value: company.peg.toFixed(2), highlight: company.peg < 1 },
          { label: 'ROE', value: `${company.roe.toFixed(1)}%` },
          { label: 'ROA', value: `${company.roa.toFixed(1)}%` },
          { label: '배당률', value: `${company.dividendYield.toFixed(1)}%` },
          { label: '부채비율', value: `${company.debtRatio.toFixed(0)}%` },
        ].map((m, i) => (
          <div key={i} className={`rounded-xl p-3 border text-center ${m.highlight ? 'bg-green-900/20 border-green-700/30' : 'bg-gray-900 border-gray-800'}`}>
            <p className="text-xs text-gray-400 mb-1 truncate">{m.label}</p>
            <p className={`text-sm font-bold ${m.highlight ? 'text-green-400' : 'text-white'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">📈 주가 차트 (2024)</h3>
        <PriceChart result={result} />
      </div>

      {/* Hot reasons */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          🔥 왜 지금 핫한가
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hotReasons.map((r, i) => <HotReasonCard key={i} reason={r} />)}
        </div>
      </div>

      {/* Valuation cards */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">📐 고평가 / 저평가 분석</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[pegVal, perVal, forwardPer].filter((v): v is ValuationSignal => !!v).map((v, i) => (
            <ValuationCard key={i} v={v} />
          ))}
        </div>
      </div>

      {/* Bull / Bear */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bullCase && (
          <div className="bg-green-900/15 border border-green-700/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-green-300 flex items-center gap-2">
                <TrendingUp size={16} /> 강세 시나리오 (Bull Case)
              </h3>
              <span className="text-xs bg-green-900/40 text-green-300 border border-green-700/30 px-2.5 py-1 rounded-full font-semibold">
                확률 {bullCase.probability}%
              </span>
            </div>
            <p className="text-sm text-green-400 font-semibold mb-2">목표 수익률: +{bullCase.targetPriceChange}%</p>
            <ul className="space-y-1.5">
              {bullCase.points.map((p, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-2">
                  <span className="text-green-400 flex-shrink-0">▲</span>{p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {bearCase && (
          <div className="bg-red-900/15 border border-red-700/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-red-300 flex items-center gap-2">
                <TrendingDown size={16} /> 약세 시나리오 (Bear Case)
              </h3>
              <span className="text-xs bg-red-900/40 text-red-300 border border-red-700/30 px-2.5 py-1 rounded-full font-semibold">
                확률 {bearCase.probability}%
              </span>
            </div>
            <p className="text-sm text-red-400 font-semibold mb-2">하락 시나리오: {bearCase.targetPriceChange}%</p>
            <ul className="space-y-1.5">
              {bearCase.points.map((p, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-2">
                  <span className="text-red-400 flex-shrink-0">▼</span>{p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Competitors */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">🏆 경쟁사 비교</h3>
        <CompetitorTable competitors={competitors} currentTicker={company.ticker} />
      </div>

      {/* Entry timing */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">⏰ 매수 타이밍 분석</h3>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${entrySignalStyle(entryTiming.signal)}`}>
            {entrySignalText(entryTiming.signal)}
          </span>
          <span className="text-xs text-gray-400">신뢰도</span>
          <div className="flex-1 max-w-32 bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-indigo-500 strength-bar"
              style={{ width: `${entryTiming.confidence}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-indigo-300">{entryTiming.confidence}%</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: '지지선', value: formatPrice(entryTiming.supportLevel), color: 'text-green-400' },
            { label: '저항선', value: formatPrice(entryTiming.resistanceLevel), color: 'text-red-400' },
            { label: '목표주가', value: formatPrice(entryTiming.targetPrice), color: 'text-indigo-300' },
            { label: '손절선', value: formatPrice(entryTiming.stopLoss), color: 'text-orange-400' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-indigo-900/20 border border-indigo-700/30 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-300 leading-relaxed">{entryTiming.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

// ── AppContent ────────────────────────────────────────────────────────────────

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('리포트');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('krStockWatchlist');
      if (stored) setWatchlist(JSON.parse(stored) as WatchlistItem[]);
    } catch {
      // ignore
    }
  }, []);

  const { data: analysisResult, isPending: isLoadingReport, isError: isReportError } = useQuery({
    queryKey: ['company', searchQuery],
    queryFn: () => searchCompany(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const { data: notes = [], isPending: isLoadingNotes } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  const { data: reviewItems = [] } = useQuery({
    queryKey: ['review'],
    queryFn: getReviewSchedule,
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      setSearchQuery(q);
      setActiveTab('리포트');
      searchRef.current?.blur();
    }
  }, [searchInput]);

  const handleSectorCompanyClick = useCallback((name: string) => {
    setSearchInput(name);
    setSearchQuery(name);
    setActiveTab('리포트');
  }, []);

  const handleWatchlistSelect = useCallback((name: string) => {
    setSearchInput(name);
    setSearchQuery(name);
    setActiveTab('리포트');
  }, []);

  const addToWatchlist = useCallback((company: CompanyInfo) => {
    const item: WatchlistItem = {
      name: company.name,
      ticker: company.ticker,
      price: company.price,
      priceChange: company.priceChange,
      priceChangePercent: company.priceChangePercent,
      market: company.market,
    };
    setWatchlist(prev => {
      const newList = [...prev.filter(w => w.ticker !== company.ticker), item];
      localStorage.setItem('krStockWatchlist', JSON.stringify(newList));
      return newList;
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    setWatchlist(prev => {
      const newList = prev.filter(w => w.ticker !== ticker);
      localStorage.setItem('krStockWatchlist', JSON.stringify(newList));
      return newList;
    });
  }, []);

  const TABS: { id: Tab; icon: React.ReactNode }[] = [
    { id: '리포트', icon: <BarChart2 size={15} /> },
    { id: '매크로', icon: <TrendingUp size={15} /> },
    { id: '섹터맵', icon: <MapPin size={15} /> },
    { id: '학습', icon: <BookOpen size={15} /> },
    { id: '워치리스트', icon: <Star size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-4 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl">📊</span>
              <span className="font-bold text-white text-base hidden sm:block">StockLens Korea</span>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="기업명 검색 (예: SK하이닉스, 삼성전자)"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </form>

            {/* Watchlist badge */}
            {watchlist.length > 0 && (
              <button
                onClick={() => setActiveTab('워치리스트')}
                className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl hover:bg-yellow-500/20 transition-colors flex-shrink-0"
              >
                <Star size={13} fill="currentColor" />
                {watchlist.length}
              </button>
            )}
          </div>

          {/* Nav tabs */}
          <nav className="flex gap-0.5 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                {tab.icon}
                {tab.id}
                {tab.id === '워치리스트' && watchlist.length > 0 && (
                  <span className="text-xs bg-indigo-900/50 text-indigo-300 px-1.5 rounded-full">
                    {watchlist.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === '리포트' && (
          <ReportTab
            result={analysisResult}
            isLoading={isLoadingReport}
            isError={isReportError}
            searchQuery={searchQuery}
            watchlist={watchlist}
            onAddToWatchlist={addToWatchlist}
            onRemoveFromWatchlist={removeFromWatchlist}
          />
        )}
        {activeTab === '매크로' && <MacroTab />}
        {activeTab === '섹터맵' && <SectorMapTab onCompanyClick={handleSectorCompanyClick} />}
        {activeTab === '학습' && (
          <LearningTab notes={notes} reviewItems={reviewItems} isLoadingNotes={isLoadingNotes} />
        )}
        {activeTab === '워치리스트' && (
          <WatchlistTab
            watchlist={watchlist}
            onRemove={removeFromWatchlist}
            onSelect={handleWatchlistSelect}
          />
        )}
      </main>
    </div>
  );
}

// ── QueryClient ───────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;

