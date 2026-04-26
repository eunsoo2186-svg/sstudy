import axios from 'axios';
import { AnalysisResult, MacroIndicator, LearningNote, ReviewItem, ChartDataPoint, ChartEvent } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

function generateChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = 130000;
  const startDate = new Date('2024-01-02');

  const eventDates: { [key: string]: ChartEvent[] } = {
    '2024-01-15': [{ date: '2024-01-15', type: 'earnings', title: 'Q4 2023 실적 발표', detail: '매출 11.3조원, 영업이익 흑자전환 성공. 시장 기대치 상회.', impact: 'positive' }],
    '2024-02-05': [{ date: '2024-02-05', type: 'news', title: 'HBM3E 양산 시작', detail: 'NVIDIA 차세대 GPU향 HBM3E 공급 계약 체결 및 양산 돌입.', impact: 'positive' }],
    '2024-02-20': [{ date: '2024-02-20', type: 'institution', title: '외국인 대규모 매수', detail: '외국인 투자자 3,500억원 순매수. 반도체 사이클 바닥 인식.', impact: 'positive' }],
    '2024-03-10': [{ date: '2024-03-10', type: 'news', title: '미국 수출규제 우려', detail: '미국 상무부 첨단 반도체 장비 추가 규제 검토. 단기 불확실성.', impact: 'negative' }],
    '2024-04-15': [{ date: '2024-04-15', type: 'earnings', title: 'Q1 2024 실적 발표', detail: '매출 12.4조원, 영업이익 2.8조원. HBM 매출 비중 30% 돌파.', impact: 'positive' }],
    '2024-05-20': [{ date: '2024-05-20', type: 'product', title: 'COMPUTEX 2024 HBM4 발표', detail: 'HBM4 개발 로드맵 공개. 2025년 양산 목표 발표로 시장 주목.', impact: 'positive' }],
    '2024-06-03': [{ date: '2024-06-03', type: 'news', title: '중국 수출 제한 우려 재점화', detail: '미중 무역 갈등 재고조로 중국향 HBM 수출 불확실성 증가.', impact: 'negative' }],
  };

  for (let i = 0; i < 130; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const change = (Math.random() - 0.45) * 3000;
    const open = price;
    const close = Math.max(90000, price + change);
    const high = Math.max(open, close) + Math.random() * 2000;
    const low = Math.min(open, close) - Math.random() * 2000;
    const volume = Math.floor(Math.random() * 8000000 + 2000000);
    const dateStr = date.toISOString().split('T')[0];
    const events = eventDates[dateStr] || [];
    data.push({ date: dateStr, open: Math.round(open), close: Math.round(close), high: Math.round(high), low: Math.round(low), volume, events });
    price = close;
  }
  return data;
}

const mockAnalysisResult: AnalysisResult = {
  company: { name: 'SK하이닉스', ticker: '000660', price: 178500, priceChange: 3500, priceChangePercent: 2.0, marketCap: 129800000000000, per: 24.3, pbr: 2.1, peg: 0.82, psr: 2.8, roe: 8.6, roa: 4.2, debtRatio: 42.3, dividendYield: 0.8, market: 'KOSPI' },
  sector: { major: '정보기술', middle: '반도체', minor: '메모리반도체', detail: 'HBM(고대역폭메모리)', trendCategories: ['AI 인프라', 'HBM 공급망', '데이터센터', '엣지AI', '온디바이스AI'] },
  hotReasons: [
    { type: 'valuation', title: '밸류에이션 시그널', strength: 78, keyMetrics: [{ label: 'PEG 비율', value: '0.82 (1.0 이하 저평가)' }, { label: 'PBR', value: '2.1x (섹터 평균 2.8x 대비 저평가)' }, { label: '목표주가 대비', value: '현재가 대비 28% 업사이드' }], interpretation: 'PEG 0.82로 성장 대비 현저히 저평가. HBM 성장성을 반영하면 적정 PEG 1.2~1.5 수준으로 추가 상승 여력 존재.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 62, keyMetrics: [{ label: '최근 90일 내부자 매수', value: '임원 3인, 총 47억원' }, { label: '외국인 순매수', value: '최근 1개월 +8,200억원' }, { label: '기관 누적 순매수', value: '최근 3개월 +1.2조원' }], interpretation: '경영진의 지속적 자사주 매입과 외국인/기관의 대규모 순매수는 강한 내부 신뢰 신호.' },
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 92, keyMetrics: [{ label: 'HBM 시장점유율', value: '53% (업계 1위)' }, { label: 'HBM3E 납품처', value: 'NVIDIA H200, Google TPU v5' }, { label: 'HBM4 개발 일정', value: '2025년 Q1 양산 목표' }], interpretation: 'AI 반도체 핵심 부품 HBM에서 독보적 기술 우위.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 71, keyMetrics: [{ label: '영업이익 성장률 (YoY)', value: '+382% (2024E)' }, { label: 'HBM 매출 비중', value: '30% → 45% (2024E → 2025E)' }, { label: '영업이익률 개선', value: '△12% → +22% (턴어라운드)' }], interpretation: '반도체 다운사이클 완전 탈출. HBM 고마진 제품 믹스 개선으로 수익성 구조적 향상.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 68, keyMetrics: [{ label: '최근 주요 이벤트', value: 'COMPUTEX 2024 HBM4 로드맵 공개' }, { label: '애널리스트 커버리지', value: '목표주가 상향 6건 (최근 1개월)' }, { label: '언론 센티먼트', value: '긍정 78% / 중립 15% / 부정 7%' }], interpretation: 'AI 붐과 함께 글로벌 테크 미디어의 집중 조명.' },
  ],
  valuation: [
    { type: 'PER', value: 24.3, benchmark: 31.2, signal: 'bullish', description: '섹터 평균 대비 22% 저평가. 실적 개선 사이클 초입 구간.' },
    { type: 'PBR', value: 2.1, benchmark: 2.8, signal: 'bullish', description: '순자산 대비 합리적 수준. 메모리 사이클 정상화 시 재평가 여지.' },
    { type: 'PEG', value: 0.82, benchmark: 1.0, signal: 'bullish', description: 'PEG 1 미만은 성장 대비 저평가의 강한 시그널.' },
    { type: 'ROE', value: 8.6, benchmark: 12.0, signal: 'neutral', description: '아직 사이클 정상 ROE 미달. 2025년 20%+ 회복 예상.' },
    { type: 'PSR', value: 2.8, benchmark: 3.5, signal: 'bullish', description: '매출 대비 저평가. HBM 고단가 매출 증가로 개선 기대.' },
  ],
  chartData: generateChartData(),
  competitors: [
    { name: 'SK하이닉스', ticker: '000660', marketShare: 53, rdRate: 8.2, roa: 4.2, debtRatio: 42.3, keyAdvantage: 'HBM 기술 선도' },
    { name: 'Samsung Electronics', ticker: '005930', marketShare: 28, rdRate: 7.1, roa: 6.8, debtRatio: 26.1, keyAdvantage: '규모의 경제' },
    { name: 'Micron Technology', ticker: 'MU', marketShare: 19, rdRate: 11.3, roa: 3.1, debtRatio: 38.7, keyAdvantage: '미국 지원 수혜' },
  ],
  bullBear: [
    { case: 'bull', probability: 65, points: ['AI 데이터센터 HBM 수요 2024-26년 CAGR 80%+ 예상', 'HBM3E/HBM4 기술 우위로 ASP 지속 상승', 'PEG 0.82로 성장 대비 명확한 저평가 구간', '영업이익률 2025년 25%+ 회복으로 구조적 수익성 개선', 'NVIDIA, Google, Amazon 등 빅테크 멀티소싱 계약 확대'], targetPriceChange: 38 },
    { case: 'bear', probability: 35, points: ['미국의 대중국 반도체 수출규제 강화로 중국 시장 상실 위험', '부채비율 42%로 금리 상승 시 재무 부담 증가', '삼성전자의 HBM 점유율 역전 가능성 (2025년)', 'AI 투자 버블 붕괴 시 HBM 수요 급감 위험', 'DRAM 전통 제품 가격 하락 재개 시 실적 타격'], targetPriceChange: -25 },
  ],
  entryTiming: { signal: 'buy', confidence: 72, supportLevel: 162000, resistanceLevel: 190000, targetPrice: 246000, stopLoss: 152000, reasoning: '현재가 178,500원은 62,000원 지지선 위에서 안정적 흐름. RSI 52로 과매수 부담 없음. HBM 모멘텀과 저평가 매력이 공존하는 분할 매수 적기.' },
  macro: [
    { name: 'AI 데이터센터 투자 지수', value: 8.4, weight: 25, impact: 'positive', trend: 'up', description: 'MS, Google, Amazon의 AI 인프라 투자 2024년 합계 $300B+ 예상', sectorRelevance: 'HBM 수요 직결' },
    { name: '미국 기준금리', value: 5.25, weight: 20, impact: 'negative', trend: 'stable', description: '고금리 지속으로 성장주 밸류에이션 압박. 2024 H2 인하 기대', sectorRelevance: '자본비용 영향' },
    { name: '반도체 섹터 PMI', value: 54.2, weight: 20, impact: 'positive', trend: 'up', description: '반도체 업황 PMI 50 상회로 업사이클 진입 확인. 3개월 연속 상승', sectorRelevance: '업황 직결 지표' },
    { name: 'DRAM 현물가 지수', value: 6.8, weight: 20, impact: 'positive', trend: 'up', description: 'DDR5 현물가 5개월 연속 상승. 고용량 수요 증가가 가격 견인', sectorRelevance: '매출/마진 직결' },
    { name: '미중 무역긴장도', value: 7.1, weight: 15, impact: 'negative', trend: 'up', description: '중국 첨단 반도체 추가 수출규제 협의 중. 리스크 상존', sectorRelevance: '중국 매출 리스크' },
  ],
};

export async function searchCompany(name: string): Promise<AnalysisResult> {
  try {
    const response = await apiClient.get(`/company/${encodeURIComponent(name)}`);
    return response.data;
  } catch {
    await new Promise(r => setTimeout(r, 1200));
    return { ...mockAnalysisResult, company: { ...mockAnalysisResult.company, name } };
  }
}

export async function getMacroData(_sector: string): Promise<MacroIndicator[]> {
  try {
    const response = await apiClient.get(`/macro/${encodeURIComponent(_sector)}`);
    return response.data;
  } catch {
    return mockAnalysisResult.macro;
  }
}

export async function getNotes(): Promise<LearningNote[]> {
  try {
    const response = await apiClient.get('/notes');
    return response.data;
  } catch {
    return [{ id: '1', companyName: 'SK하이닉스', title: 'HBM 사이클 분석 노트', stage1: 'SK하이닉스는 DRAM/NAND 메모리 반도체 전문 기업. HBM 시장 점유율 53%로 1위.', stage2: 'PEG 0.82로 저평가. 2024년 영업이익 +382% 성장 예상.', stage3: 'AI 인프라 투자 증가 → HBM 수요 급증 → SK하이닉스 수혜 로직.', stage4: '중국 수출규제, 삼성 추격, AI 버블 등 리스크 존재.', stage5: '목표가 246,000원. 지지선 162,000원에서 손절. 분할 매수 전략.', tags: ['HBM', '메모리반도체', 'AI수혜주', '저평가'], concepts: ['PEG비율', 'HBM', '반도체사이클', '분할매수'], createdAt: '2024-06-01', updatedAt: '2024-06-05' }];
  }
}

export async function saveNote(note: LearningNote): Promise<LearningNote> {
  try {
    const response = await apiClient.post('/notes', note);
    return response.data;
  } catch {
    return { ...note, updatedAt: new Date().toISOString().split('T')[0] };
  }
}

export async function getReviewSchedule(): Promise<ReviewItem[]> {
  try {
    const response = await apiClient.get('/review');
    return response.data;
  } catch {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    return [
      { conceptId: '1', conceptName: 'PEG 비율', dueDate: today.toISOString().split('T')[0], reviewCount: 2, nextInterval: 1 },
      { conceptId: '2', conceptName: 'HBM (고대역폭메모리)', dueDate: today.toISOString().split('T')[0], reviewCount: 1, nextInterval: 1 },
      { conceptId: '3', conceptName: '반도체 업황 사이클', dueDate: tomorrow.toISOString().split('T')[0], reviewCount: 3, nextInterval: 3 },
      { conceptId: '4', conceptName: '분할매수 전략', dueDate: nextWeek.toISOString().split('T')[0], reviewCount: 5, nextInterval: 7 },
    ];
  }
}
