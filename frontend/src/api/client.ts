import axios from 'axios';
import type { AnalysisResult, MacroIndicator, LearningNote, ReviewItem, ChartDataPoint, ChartEvent } from '../types';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

function generateChartData(basePrice: number, eventDates: { [key: string]: ChartEvent[] } = {}): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice;
  const startDate = new Date('2024-01-02');

  for (let i = 0; i < 130; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const change = (Math.random() - 0.45) * basePrice * 0.022;
    const open = price;
    const close = Math.max(basePrice * 0.5, price + change);
    const high = Math.max(open, close) + Math.random() * basePrice * 0.008;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.008;
    const volume = Math.floor(Math.random() * 8000000 + 2000000);
    const dateStr = date.toISOString().split('T')[0];
    const events = eventDates[dateStr] || [];
    data.push({ date: dateStr, open: Math.round(open), close: Math.round(close), high: Math.round(high), low: Math.round(low), volume, events });
    price = close;
  }
  return data;
}

const skHynixEvents: { [key: string]: ChartEvent[] } = {
  '2024-01-15': [{ date: '2024-01-15', type: 'earnings', title: 'Q4 2023 실적 발표', detail: '매출 11.3조원, 영업이익 흑자전환 성공.', impact: 'positive' }],
  '2024-02-05': [{ date: '2024-02-05', type: 'news', title: 'HBM3E 양산 시작', detail: 'NVIDIA 차세대 GPU향 HBM3E 공급 계약 체결.', impact: 'positive' }],
  '2024-03-10': [{ date: '2024-03-10', type: 'news', title: '미국 수출규제 우려', detail: '미국 상무부 첨단 반도체 장비 추가 규제 검토.', impact: 'negative' }],
  '2024-04-15': [{ date: '2024-04-15', type: 'earnings', title: 'Q1 2024 실적 발표', detail: '매출 12.4조원, 영업이익 2.8조원. HBM 매출 비중 30% 돌파.', impact: 'positive' }],
  '2024-05-20': [{ date: '2024-05-20', type: 'product', title: 'COMPUTEX 2024 HBM4 발표', detail: 'HBM4 개발 로드맵 공개. 2025년 양산 목표.', impact: 'positive' }],
};

const samsungEvents: { [key: string]: ChartEvent[] } = {
  '2024-01-09': [{ date: '2024-01-09', type: 'earnings', title: 'Q4 2023 잠정실적', detail: '영업이익 2.8조원. 반도체 적자 지속, 세트 부문 개선.', impact: 'neutral' }],
  '2024-04-05': [{ date: '2024-04-05', type: 'earnings', title: 'Q1 2024 잠정실적', detail: '영업이익 6.6조원. 예상 대폭 상회 서프라이즈.', impact: 'positive' }],
  '2024-05-15': [{ date: '2024-05-15', type: 'news', title: 'HBM3E 8단 엔비디아 공급', detail: '엔비디아 HBM3E 퀄 통과 소식.', impact: 'positive' }],
};

const hyundaiEvents: { [key: string]: ChartEvent[] } = {
  '2024-01-25': [{ date: '2024-01-25', type: 'earnings', title: 'Q4 2023 실적', detail: '영업이익 3.5조원. 연간 최대 실적 달성.', impact: 'positive' }],
  '2024-03-20': [{ date: '2024-03-20', type: 'product', title: '아이오닉9 세계 최초 공개', detail: '대형 SUV EV 아이오닉9 글로벌 공개.', impact: 'positive' }],
  '2024-04-25': [{ date: '2024-04-25', type: 'earnings', title: 'Q1 2024 실적', detail: '영업이익 3.7조원. 북미·인도 판매 호조.', impact: 'positive' }],
};

const celltrionEvents: { [key: string]: ChartEvent[] } = {
  '2024-02-01': [{ date: '2024-02-01', type: 'news', title: '렉키로나 미국 허가', detail: '코로나 항체치료제 미국 FDA 최종 승인.', impact: 'positive' }],
  '2024-04-11': [{ date: '2024-04-11', type: 'earnings', title: 'Q1 2024 실적', detail: '매출 7,200억원, 영업이익 2,100억원.', impact: 'positive' }],
};

const lgEnergyEvents: { [key: string]: ChartEvent[] } = {
  '2024-01-24': [{ date: '2024-01-24', type: 'earnings', title: 'Q4 2023 실적', detail: '영업이익 3,382억원. 전기차 둔화 우려 반영.', impact: 'neutral' }],
  '2024-04-24': [{ date: '2024-04-24', type: 'earnings', title: 'Q1 2024 실적', detail: '영업이익 1,573억원. 전분기 대비 감소.', impact: 'negative' }],
  '2024-05-10': [{ date: '2024-05-10', type: 'news', title: 'GM 합작 공장 확장', detail: '미국 미시간 Ultium 2공장 착공 확정.', impact: 'positive' }],
};

const kakaoEvents: { [key: string]: ChartEvent[] } = {
  '2024-02-08': [{ date: '2024-02-08', type: 'earnings', title: 'Q4 2023 실적', detail: '영업이익 1,048억원. 카카오페이·픽코마 적자 부담.', impact: 'neutral' }],
  '2024-03-15': [{ date: '2024-03-15', type: 'news', title: '카카오AI 전략 발표', detail: '자체 LLM \'카나나\' 공개 및 AI 서비스 로드맵 제시.', impact: 'positive' }],
};

const kbEvents: { [key: string]: ChartEvent[] } = {
  '2024-02-07': [{ date: '2024-02-07', type: 'earnings', title: 'Q4 2023 실적', detail: '연간 순익 4.9조원. 역대 최대.', impact: 'positive' }],
  '2024-04-25': [{ date: '2024-04-25', type: 'earnings', title: 'Q1 2024 실적', detail: '순익 1.5조원. 홍콩ELS 손실에도 선방.', impact: 'neutral' }],
};

// ── Mock data per company ───────────────────────────────────────────────────

const mockSKHynix: AnalysisResult = {
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
    { type: 'Forward PER', value: 14.1, benchmark: 20.0, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 14.1x. 성장성 대비 매력적.' },
    { type: 'PBR', value: 2.1, benchmark: 2.8, signal: 'bullish', description: '순자산 대비 합리적 수준. 메모리 사이클 정상화 시 재평가 여지.' },
    { type: 'PEG', value: 0.82, benchmark: 1.0, signal: 'bullish', description: 'PEG 1 미만은 성장 대비 저평가의 강한 시그널.' },
    { type: 'ROE', value: 8.6, benchmark: 12.0, signal: 'neutral', description: '아직 사이클 정상 ROE 미달. 2025년 20%+ 회복 예상.' },
  ],
  chartData: generateChartData(130000, skHynixEvents),
  competitors: [
    { name: 'SK하이닉스', ticker: '000660', marketShare: 53, rdRate: 8.2, roa: 4.2, debtRatio: 42.3, keyAdvantage: 'HBM 기술 선도' },
    { name: '삼성전자', ticker: '005930', marketShare: 28, rdRate: 7.1, roa: 6.8, debtRatio: 26.1, keyAdvantage: '규모의 경제' },
    { name: 'Micron Technology', ticker: 'MU', marketShare: 19, rdRate: 11.3, roa: 3.1, debtRatio: 38.7, keyAdvantage: '미국 지원 수혜' },
  ],
  bullBear: [
    { case: 'bull', probability: 65, points: ['AI 데이터센터 HBM 수요 2024-26년 CAGR 80%+ 예상', 'HBM3E/HBM4 기술 우위로 ASP 지속 상승', 'PEG 0.82로 성장 대비 명확한 저평가 구간', '영업이익률 2025년 25%+ 회복으로 구조적 수익성 개선', 'NVIDIA, Google, Amazon 등 빅테크 멀티소싱 계약 확대'], targetPriceChange: 38 },
    { case: 'bear', probability: 35, points: ['미국의 대중국 반도체 수출규제 강화로 중국 시장 상실 위험', '부채비율 42%로 금리 상승 시 재무 부담 증가', '삼성전자의 HBM 점유율 역전 가능성 (2025년)', 'AI 투자 버블 붕괴 시 HBM 수요 급감 위험', 'DRAM 전통 제품 가격 하락 재개 시 실적 타격'], targetPriceChange: -25 },
  ],
  entryTiming: { signal: 'buy', confidence: 72, supportLevel: 162000, resistanceLevel: 190000, targetPrice: 246000, stopLoss: 152000, reasoning: '현재가 178,500원은 162,000원 지지선 위에서 안정적 흐름. RSI 52로 과매수 부담 없음. HBM 모멘텀과 저평가 매력이 공존하는 분할 매수 적기.' },
  macro: [
    { name: 'AI 데이터센터 투자 지수', value: 8.4, weight: 25, impact: 'positive', trend: 'up', description: 'MS, Google, Amazon의 AI 인프라 투자 2024년 합계 $300B+ 예상', sectorRelevance: 'HBM 수요 직결' },
    { name: '미국 기준금리', value: 5.25, weight: 20, impact: 'negative', trend: 'stable', description: '고금리 지속으로 성장주 밸류에이션 압박', sectorRelevance: '자본비용 영향' },
    { name: '반도체 섹터 PMI', value: 54.2, weight: 20, impact: 'positive', trend: 'up', description: '반도체 업황 PMI 50 상회로 업사이클 진입 확인', sectorRelevance: '업황 직결 지표' },
    { name: 'DRAM 현물가 지수', value: 6.8, weight: 20, impact: 'positive', trend: 'up', description: 'DDR5 현물가 5개월 연속 상승', sectorRelevance: '매출/마진 직결' },
    { name: '미중 무역긴장도', value: 7.1, weight: 15, impact: 'negative', trend: 'up', description: '중국 첨단 반도체 추가 수출규제 협의 중', sectorRelevance: '중국 매출 리스크' },
  ],
};

const mockSamsung: AnalysisResult = {
  company: { name: '삼성전자', ticker: '005930', price: 75400, priceChange: -600, priceChangePercent: -0.79, marketCap: 450200000000000, per: 18.7, pbr: 1.4, peg: 1.12, psr: 1.8, roe: 7.5, roa: 5.1, debtRatio: 26.1, dividendYield: 2.1, market: 'KOSPI' },
  sector: { major: '정보기술', middle: '반도체', minor: '종합반도체', detail: 'DRAM/NAND/파운드리', trendCategories: ['AI 반도체', 'HBM', '파운드리', '스마트폰', 'NAND'] },
  hotReasons: [
    { type: 'valuation', title: '밸류에이션 시그널', strength: 65, keyMetrics: [{ label: 'PBR', value: '1.4x (역사적 저점 근접)' }, { label: 'PER', value: '18.7x (섹터 대비 저평가)' }, { label: '배당수익률', value: '2.1% (안정적 배당)' }], interpretation: 'PBR 1.4x로 역사적 저점 수준. 반도체 업황 회복 시 강한 재평가 기대.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 74, keyMetrics: [{ label: '영업이익 (Q1 2024)', value: '6.6조원 (서프라이즈)' }, { label: '메모리 가격 회복', value: 'DRAM +15%, NAND +20% (QoQ)' }, { label: 'HBM3E 엔비디아 공급', value: '2024년 하반기 본격화' }], interpretation: '반도체 사이클 회복과 HBM 진입으로 실적 개선 가속.' },
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 81, keyMetrics: [{ label: '파운드리 GAA 공정', value: '2nm GAA 2025년 양산 계획' }, { label: 'HBM3E 개발', value: '엔비디아 퀄 통과 완료' }, { label: '모바일 AP', value: 'Exynos 2500 성능 개선' }], interpretation: '메모리+파운드리+세트 통합 시너지. 글로벌 유일 수직계열화 기업.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 58, keyMetrics: [{ label: '자사주 매입', value: '최근 1년 3조원 규모' }, { label: '외국인 지분율', value: '54.2% (안정적 고지분)' }, { label: '기관 순매수', value: '최근 1개월 +4,200억원' }], interpretation: '대규모 자사주 매입과 외국인 고지분율은 글로벌 수요 신뢰 반영.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 70, keyMetrics: [{ label: '목표주가 상향', value: '애널리스트 9건 상향 (최근 1개월)' }, { label: '컨센서스 목표가', value: '100,000원 (현재 대비 +33%)' }, { label: '언론 센티먼트', value: '긍정 72% / 중립 20% / 부정 8%' }], interpretation: '반도체 사이클 회복과 AI 수혜 기대감으로 긍정적 커버리지 증가.' },
  ],
  valuation: [
    { type: 'PER', value: 18.7, benchmark: 25.0, signal: 'bullish', description: '섹터 평균 대비 25% 저평가. 실적 회복 사이클 본격화.' },
    { type: 'Forward PER', value: 12.3, benchmark: 18.0, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 12.3x. 성장성 반영 시 명확한 저평가.' },
    { type: 'PBR', value: 1.4, benchmark: 2.0, signal: 'bullish', description: '역사적 저점 PBR 수준. 자산 대비 과도한 할인 구간.' },
    { type: 'PEG', value: 1.12, benchmark: 1.0, signal: 'neutral', description: 'PEG 1.12로 소폭 고평가 영역. 성장률 가속 시 재평가 여지.' },
    { type: 'ROE', value: 7.5, benchmark: 15.0, signal: 'bearish', description: '사이클 저점 ROE. 2025년 20%+ 회복 기대.' },
  ],
  chartData: generateChartData(68000, samsungEvents),
  competitors: [
    { name: '삼성전자', ticker: '005930', marketShare: 45, rdRate: 7.1, roa: 5.1, debtRatio: 26.1, keyAdvantage: '수직계열화 시너지' },
    { name: 'SK하이닉스', ticker: '000660', marketShare: 30, rdRate: 8.2, roa: 4.2, debtRatio: 42.3, keyAdvantage: 'HBM 기술 선도' },
    { name: 'TSMC', ticker: 'TSM', marketShare: 25, rdRate: 9.5, roa: 18.2, debtRatio: 32.1, keyAdvantage: '파운드리 1위' },
  ],
  bullBear: [
    { case: 'bull', probability: 60, points: ['반도체 업사이클 재진입으로 메모리 가격 상승 지속', 'HBM3E 엔비디아 공급 본격화로 고마진 제품 믹스 개선', 'PBR 1.4x 역사적 저평가로 하방 지지력 강함', '파운드리 2nm 공정 기술 완성 시 TSMC 점유율 탈환 기대', '배당수익률 2.1% + 자사주 소각으로 주주환원 강화'], targetPriceChange: 33 },
    { case: 'bear', probability: 40, points: ['HBM 시장에서 SK하이닉스 대비 기술 격차 지속', '중국 메모리 업체(CXMT) 성장으로 NAND 가격 재하락 위험', '파운드리 수율 문제 지속으로 고객사 이탈', '스마트폰 수요 회복 지연', 'AI 반도체 시장에서 후발주자 불리'], targetPriceChange: -20 },
  ],
  entryTiming: { signal: 'buy', confidence: 68, supportLevel: 68000, resistanceLevel: 82000, targetPrice: 100000, stopLoss: 62000, reasoning: '현재가 75,400원은 68,000원 강지지 위에서 횡보. 반도체 업황 회복 초입 구간으로 분할 매수 전략 유효.' },
  macro: [
    { name: 'DRAM 현물가', value: 7.2, weight: 25, impact: 'positive', trend: 'up', description: 'DDR5 현물가 상승세 지속', sectorRelevance: '메모리 매출 직결' },
    { name: '스마트폰 출하량', value: 5.8, weight: 20, impact: 'positive', trend: 'up', description: '글로벌 스마트폰 출하 반등', sectorRelevance: '세트 및 모바일 칩 수요' },
    { name: 'AI 서버 투자', value: 8.1, weight: 20, impact: 'positive', trend: 'up', description: 'HBM 및 고용량 NAND 수요 견인', sectorRelevance: 'HBM/엔터프라이즈 SSD' },
    { name: '원/달러 환율', value: 1280, weight: 15, impact: 'positive', trend: 'stable', description: '환율 안정으로 수출 채산성 유지', sectorRelevance: '달러 수출 비중 70%+' },
    { name: '중국 경쟁 심화', value: 6.5, weight: 20, impact: 'negative', trend: 'up', description: 'CXMT 등 중국 메모리 업체 공세', sectorRelevance: 'NAND 가격 하방 압력' },
  ],
};

const mockHyundai: AnalysisResult = {
  company: { name: '현대차', ticker: '005380', price: 248500, priceChange: 2000, priceChangePercent: 0.81, marketCap: 53200000000000, per: 6.2, pbr: 0.68, peg: 0.54, psr: 0.38, roe: 11.2, roa: 4.8, debtRatio: 185.3, dividendYield: 3.4, market: 'KOSPI' },
  sector: { major: '자동차', middle: '완성차', minor: '글로벌 OEM', detail: '친환경차(EV/HEV)', trendCategories: ['전기차 전환', '자율주행', '소프트웨어차량(SDV)', '북미 IRA 수혜', '인도 고성장'] },
  hotReasons: [
    { type: 'valuation', title: '밸류에이션 시그널', strength: 85, keyMetrics: [{ label: 'PBR', value: '0.68x (글로벌 OEM 최저 수준)' }, { label: 'PER', value: '6.2x (글로벌 완성차 평균 8x 대비 저평가)' }, { label: 'PEG', value: '0.54 (성장성 대비 극저평가)' }], interpretation: 'PBR 0.68x로 순자산 이하 거래. 글로벌 완성차 중 가장 낮은 밸류에이션.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 82, keyMetrics: [{ label: '연간 영업이익', value: '15.1조원 (2023 최대)' }, { label: '영업이익률', value: '9.0% (글로벌 OEM 최상위)' }, { label: '주주환원', value: '배당 3.4% + 자사주 매입' }], interpretation: '역대 최대 실적에도 극저평가 유지. 코리아 디스카운트 해소 시 강한 재평가 기대.' },
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 74, keyMetrics: [{ label: 'EV 판매 성장', value: 'IONIQ6 글로벌 톱3 세단 EV' }, { label: '소프트웨어(SDV)', value: '2025년 SDV 전환 완료 계획' }, { label: '보스턴다이내믹스', value: 'AI 로봇 상용화 모멘텀' }], interpretation: '전기차+자율주행+로봇으로 전통 완성차를 넘는 혁신 기업으로 변모 중.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 66, keyMetrics: [{ label: '자사주 매입', value: '2024년 1.5조원 규모 매입 계획' }, { label: '외국인 지분율', value: '43.8%' }, { label: '기관 순매수', value: '최근 1개월 +2,100억원' }], interpretation: '적극적 자사주 소각과 배당 확대로 주주환원 강화 의지 표명.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 72, keyMetrics: [{ label: '인도 IPO 성공', value: '현대차인도 10억달러 상장 예정' }, { label: 'IRA 수혜', value: '미국 현지생산 전기차 세제혜택' }, { label: '컨센서스 목표가', value: '350,000원 (현재 대비 +41%)' }], interpretation: '인도 IPO와 북미 IRA 수혜로 밸류에이션 디스카운트 해소 촉매 확보.' },
  ],
  valuation: [
    { type: 'PER', value: 6.2, benchmark: 8.5, signal: 'bullish', description: '글로벌 OEM 평균 PER 대비 27% 할인. 코리아 디스카운트 해소 시 강한 재평가.' },
    { type: 'Forward PER', value: 5.8, benchmark: 7.5, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 5.8x. 극저평가 구간.' },
    { type: 'PBR', value: 0.68, benchmark: 1.0, signal: 'bullish', description: 'PBR 0.68x로 순자산 이하 거래. 이론적 청산가치 이하.' },
    { type: 'PEG', value: 0.54, benchmark: 1.0, signal: 'bullish', description: 'PEG 0.54로 성장성 대비 극저평가. 글로벌 완성차 중 최저.' },
    { type: 'ROE', value: 11.2, benchmark: 10.0, signal: 'bullish', description: 'ROE 11.2%로 글로벌 OEM 평균 상회. 효율적 자본 운용.' },
  ],
  chartData: generateChartData(195000, hyundaiEvents),
  competitors: [
    { name: '현대차', ticker: '005380', marketShare: 8.5, rdRate: 3.2, roa: 4.8, debtRatio: 185.3, keyAdvantage: '브랜드+원가경쟁력' },
    { name: '기아', ticker: '000270', marketShare: 6.8, rdRate: 2.8, roa: 5.2, debtRatio: 172.1, keyAdvantage: '디자인 경쟁력' },
    { name: 'Toyota', ticker: 'TM', marketShare: 11.2, rdRate: 4.1, roa: 7.2, debtRatio: 95.3, keyAdvantage: 'HEV 기술 선도' },
  ],
  bullBear: [
    { case: 'bull', probability: 62, points: ['PBR 0.68x 극저평가 + 자사주 소각으로 강한 하방 지지', '미국 IRA 수혜로 현지 생산 EV 세액공제 최대화', '인도 시장 점유율 1위 (21%) + IPO 모멘텀', '배당수익률 3.4% + 지속적 주주환원 강화', '소프트웨어 차량(SDV) 전환으로 서비스 매출 성장'], targetPriceChange: 41 },
    { case: 'bear', probability: 38, points: ['전기차 수요 둔화로 IONIQ 시리즈 판매 부진 가능성', '중국 BYD와의 가격 경쟁 심화', '원화 강세 지속 시 수출 수익성 하락', '자율주행 기술 격차로 테슬라·구글 대비 열위', '원자재(니켈·코발트) 가격 변동 리스크'], targetPriceChange: -22 },
  ],
  entryTiming: { signal: 'buy', confidence: 78, supportLevel: 225000, resistanceLevel: 265000, targetPrice: 350000, stopLoss: 210000, reasoning: '현재가 248,500원, PBR 0.68x 역사적 저점 근처. RSI 48로 중립. 주주환원 강화와 인도 IPO 모멘텀이 촉매. 분할 매수 전략 권고.' },
  macro: [
    { name: '글로벌 자동차 판매', value: 5.8, weight: 25, impact: 'positive', trend: 'up', description: '글로벌 자동차 수요 회복세', sectorRelevance: '판매량 직결' },
    { name: '원/달러 환율', value: 1280, weight: 20, impact: 'positive', trend: 'stable', description: '달러 강세로 수출 채산성 유지', sectorRelevance: '북미 판매 수익성' },
    { name: 'EV 배터리 가격', value: 6.2, weight: 20, impact: 'positive', trend: 'down', description: '배터리 원가 하락으로 EV 수익성 개선', sectorRelevance: 'EV 마진 개선' },
    { name: '미국 IRA 혜택', value: 8.1, weight: 20, impact: 'positive', trend: 'stable', description: '현지 생산 EV 세액공제 유지', sectorRelevance: 'EV 경쟁력' },
    { name: '중국 BYD 공세', value: 7.3, weight: 15, impact: 'negative', trend: 'up', description: '중국 BYD 글로벌 확장 가속', sectorRelevance: '신흥시장 경쟁' },
  ],
};

const mockCelltrion: AnalysisResult = {
  company: { name: '셀트리온', ticker: '068270', price: 178000, priceChange: 3500, priceChangePercent: 2.0, marketCap: 23500000000000, per: 42.1, pbr: 4.2, peg: 1.35, psr: 8.1, roe: 9.8, roa: 5.6, debtRatio: 38.2, dividendYield: 0.3, market: 'KOSPI' },
  sector: { major: '헬스케어', middle: '바이오', minor: '바이오시밀러', detail: '항체 바이오시밀러', trendCategories: ['바이오시밀러 시장', 'K-바이오', '신약 개발', '글로벌 직판', '면역질환'] },
  hotReasons: [
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 88, keyMetrics: [{ label: '바이오시밀러 파이프라인', value: '40개+ 제품 개발/출시' }, { label: '짐펜트라 미국 출시', value: '크론병·궤양성대장염 치료제' }, { label: '글로벌 직판 전환', value: '마진 개선 핵심 드라이버' }], interpretation: '글로벌 바이오시밀러 1위 기업. 직판 전환으로 수익성 구조 개선 가속.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 76, keyMetrics: [{ label: '합병 시너지', value: '셀트리온 3사 합병 완료로 효율화' }, { label: '매출 성장', value: '2024E 매출 3.5조원 (+28% YoY)' }, { label: '글로벌 직판 비중', value: '50% → 70% (2024→2025E)' }], interpretation: '3사 합병 완료로 비용 효율화 + 직판 확대로 영업이익률 15%→25% 개선 경로.' },
    { type: 'valuation', title: '밸류에이션 시그널', strength: 52, keyMetrics: [{ label: 'PER', value: '42.1x (바이오 섹터 평균 수준)' }, { label: '성장률 반영', value: '2024-26 EPS CAGR 35%+' }, { label: '목표주가', value: '250,000원 (현재 대비 +40%)' }], interpretation: '절대값 PER 42배는 높으나 성장률 감안 시 PEG 1.35로 합리적 수준.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 80, keyMetrics: [{ label: '짐펜트라 미국 처방 성장', value: 'FDA 승인 후 처방 급증세' }, { label: '유럽 바이오시밀러', value: '렉키로나 유럽 판매 확대' }, { label: '차기 블록버스터', value: '아일리아·스텔라라 바이오시밀러 준비' }], interpretation: '짐펜트라 미국 처방 성장이 주가 핵심 촉매.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 61, keyMetrics: [{ label: '서정진 회장', value: '지속적 주식 보유 유지' }, { label: '외국인 순매수', value: '최근 1개월 +1,800억원' }, { label: '기관 누적 순매수', value: '최근 3개월 +5,500억원' }], interpretation: '창업자 지분 유지와 외국인·기관 매수세 긍정적.' },
  ],
  valuation: [
    { type: 'PER', value: 42.1, benchmark: 45.0, signal: 'neutral', description: '바이오 섹터 평균 수준. 절대값은 높으나 성장성 반영 시 합리적.' },
    { type: 'Forward PER', value: 28.3, benchmark: 35.0, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 28.3x. 성장성 반영 시 저평가.' },
    { type: 'PBR', value: 4.2, benchmark: 5.0, signal: 'neutral', description: '바이오 기업 특성상 높은 PBR 수용 가능. 섹터 평균 하회.' },
    { type: 'PEG', value: 1.35, benchmark: 1.5, signal: 'bullish', description: 'PEG 1.35로 성장성 감안 시 합리적 밸류에이션.' },
    { type: 'ROE', value: 9.8, benchmark: 8.0, signal: 'bullish', description: '바이오 기업 평균 ROE 상회. 수익성 개선 추세.' },
  ],
  chartData: generateChartData(155000, celltrionEvents),
  competitors: [
    { name: '셀트리온', ticker: '068270', marketShare: 12.5, rdRate: 15.2, roa: 5.6, debtRatio: 38.2, keyAdvantage: '바이오시밀러 파이프라인' },
    { name: '삼성바이오로직스', ticker: '207940', marketShare: 8.1, rdRate: 8.3, roa: 12.1, debtRatio: 28.5, keyAdvantage: 'CMO 1위' },
    { name: 'Amgen', ticker: 'AMGN', marketShare: 18.3, rdRate: 22.1, roa: 18.5, debtRatio: 125.2, keyAdvantage: '신약 파이프라인' },
  ],
  bullBear: [
    { case: 'bull', probability: 58, points: ['짐펜트라 미국 직판으로 수익성 구조 개선', '글로벌 바이오시밀러 시장 2028년 $100B 성장', '3사 합병 완료로 비용 효율화 및 조직력 강화', '아일리아·스텔라라 바이오시밀러 신규 출시 예정', '유럽 직판 체계 구축으로 마진 30%+ 가능'], targetPriceChange: 40 },
    { case: 'bear', probability: 42, points: ['오리지널 제약사의 특허 연장 소송 위험', '글로벌 바이오시밀러 경쟁사 증가', '임상 실패 또는 허가 지연 리스크', 'PER 42배 고평가 인식으로 실적 미달 시 급락', 'R&D 비용 증가로 단기 수익성 압박'], targetPriceChange: -30 },
  ],
  entryTiming: { signal: 'buy', confidence: 62, supportLevel: 160000, resistanceLevel: 198000, targetPrice: 250000, stopLoss: 148000, reasoning: '짐펜트라 미국 처방 성장 모멘텀 + 직판 확대로 구조적 수익성 개선. 분할 매수 권고.' },
  macro: [
    { name: '글로벌 바이오시밀러 시장', value: 7.8, weight: 30, impact: 'positive', trend: 'up', description: '바이오시밀러 시장 연 15%+ 성장', sectorRelevance: '매출 성장 기반' },
    { name: '미국 약가 인하 압력', value: 5.2, weight: 25, impact: 'positive', trend: 'up', description: 'IRA 약가 협상으로 바이오시밀러 수혜', sectorRelevance: '오리지널 대비 경쟁력' },
    { name: '원/달러 환율', value: 1280, weight: 20, impact: 'positive', trend: 'stable', description: '달러 강세로 미국 매출 원화 환산 유리', sectorRelevance: '해외 매출 비중 60%+' },
    { name: 'FDA 허가 속도', value: 6.9, weight: 15, impact: 'positive', trend: 'stable', description: 'FDA 바이오시밀러 허가 패스트트랙 강화', sectorRelevance: '허가 일정 직결' },
    { name: '경쟁사 파이프라인', value: 6.1, weight: 10, impact: 'negative', trend: 'up', description: '글로벌 제약사 바이오시밀러 진출 확대', sectorRelevance: '시장점유율 경쟁' },
  ],
};

const mockLGEnergy: AnalysisResult = {
  company: { name: 'LG에너지솔루션', ticker: '373220', price: 388000, priceChange: -5000, priceChangePercent: -1.27, marketCap: 90900000000000, per: 62.4, pbr: 5.1, peg: 1.82, psr: 2.8, roe: 8.1, roa: 3.9, debtRatio: 155.2, dividendYield: 0.2, market: 'KOSPI' },
  sector: { major: '자동차', middle: '배터리', minor: 'EV 배터리', detail: '원통형·파우치형 배터리', trendCategories: ['EV 전환', '미국 IRA', '원통형 배터리', 'LFP 배터리', '에너지저장장치(ESS)'] },
  hotReasons: [
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 82, keyMetrics: [{ label: '원통형 46시리즈', value: '테슬라·GM 차세대 배터리 공급' }, { label: 'IRA 수혜', value: '미국 현지 생산 보조금 최대화' }, { label: 'ESS 수주', value: '글로벌 ESS 시장 수주 급증' }], interpretation: '원통형 배터리 기술 우위와 미국 현지화 전략으로 IRA 수혜 극대화.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 64, keyMetrics: [{ label: '수주잔고', value: '500조원 이상 (업계 최대)' }, { label: 'IRA 세액공제', value: '2024E 1.5조원 수혜' }, { label: 'AMPC 효과', value: '영업이익률 5%→8% 개선 기대' }], interpretation: '500조원 수주잔고와 IRA 보조금이 장기 성장 가시성 확보.' },
    { type: 'valuation', title: '밸류에이션 시그널', strength: 45, keyMetrics: [{ label: 'PER', value: '62.4x (성장주 프리미엄)' }, { label: '수주잔고', value: '500조원+ 장기 성장 담보' }, { label: '목표주가', value: '550,000원 (현재 대비 +42%)' }], interpretation: '현재 PER 고평가이나 수주잔고와 IRA 수혜를 반영한 중장기 DCF 가치 매력적.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 70, keyMetrics: [{ label: 'GM 합작법인', value: 'Ultium Cells 2공장 양산' }, { label: '테슬라 공급', value: '4680 원통형 배터리 본격 공급' }, { label: 'ESS 수주', value: '미국 전력망 ESS 대규모 수주' }], interpretation: 'GM, 테슬라, 현대차 등 글로벌 OEM과의 장기 공급계약 안정적.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 55, keyMetrics: [{ label: '외국인 지분율', value: '12.3%' }, { label: '기관 누적 순매수', value: '최근 3개월 +3,200억원' }, { label: '공매도 비율', value: '4.2% (업종 평균 이하)' }], interpretation: '기관 매수세 유입 긍정적. 외국인 지분율 낮아 수급 개선 여지.' },
  ],
  valuation: [
    { type: 'PER', value: 62.4, benchmark: 55.0, signal: 'bearish', description: '절대값 고평가. EV 수요 둔화 우려 반영 시 리레이팅 위험.' },
    { type: 'Forward PER', value: 35.2, benchmark: 40.0, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 35.2x. IRA 수혜 반영 시 매력적.' },
    { type: 'PBR', value: 5.1, benchmark: 6.0, signal: 'neutral', description: '성장주 프리미엄 반영한 PBR. 수주잔고 대비 합리적.' },
    { type: 'PEG', value: 1.82, benchmark: 2.0, signal: 'neutral', description: 'PEG 1.82로 성장 반영 시 중립. EV 성장률 가속 필요.' },
    { type: 'ROE', value: 8.1, benchmark: 10.0, signal: 'neutral', description: '배터리 초기 투자 부담으로 ROE 낮음. 2026년 15%+ 목표.' },
  ],
  chartData: generateChartData(430000, lgEnergyEvents),
  competitors: [
    { name: 'LG에너지솔루션', ticker: '373220', marketShare: 22.5, rdRate: 6.8, roa: 3.9, debtRatio: 155.2, keyAdvantage: 'IRA 수혜 극대화' },
    { name: '삼성SDI', ticker: '006400', marketShare: 12.8, rdRate: 7.2, roa: 5.1, debtRatio: 42.3, keyAdvantage: '전고체 배터리 선도' },
    { name: 'CATL', ticker: '300750', marketShare: 36.8, rdRate: 8.1, roa: 8.2, debtRatio: 82.1, keyAdvantage: '글로벌 1위 규모' },
  ],
  bullBear: [
    { case: 'bull', probability: 55, points: ['미국 IRA 세액공제(AMPC) 연간 1.5조원+ 수혜', '500조원 수주잔고로 2030년까지 성장 가시성', '원통형 46시리즈 테슬라·GM 공급 본격화', 'ESS 수요 폭발로 배터리 다각화 성공', '전고체 배터리 2027년 상용화 목표'], targetPriceChange: 42 },
    { case: 'bear', probability: 45, points: ['전기차 수요 둔화로 OEM 배터리 발주 감소', 'CATL 저가 LFP 배터리 공세로 시장 잠식', '대규모 설비투자로 재무 부담 지속', '미국 IRA 정책 변경 리스크', '배터리 과잉공급 우려로 가격 하락'], targetPriceChange: -35 },
  ],
  entryTiming: { signal: 'wait', confidence: 52, supportLevel: 360000, resistanceLevel: 420000, targetPrice: 550000, stopLoss: 330000, reasoning: 'EV 수요 둔화 우려와 고평가 부담으로 단기 변동성 높음. 360,000원 지지선 확인 후 분할 매수 권고.' },
  macro: [
    { name: '글로벌 EV 판매 성장', value: 6.5, weight: 30, impact: 'positive', trend: 'up', description: '글로벌 EV 2025년 1,500만대 예상', sectorRelevance: '배터리 수요 직결' },
    { name: '미국 IRA 세액공제', value: 8.2, weight: 25, impact: 'positive', trend: 'stable', description: 'AMPC 배터리 생산 보조금 유지', sectorRelevance: '원가 경쟁력' },
    { name: '리튬 가격', value: 4.2, weight: 20, impact: 'positive', trend: 'down', description: '리튬 가격 하락으로 배터리 원가 개선', sectorRelevance: '배터리 마진 직결' },
    { name: 'CATL 가격 공세', value: 7.8, weight: 15, impact: 'negative', trend: 'up', description: 'CATL 저가 LFP 배터리 점유율 확대', sectorRelevance: '수주 경쟁' },
    { name: '전고체 배터리 경쟁', value: 6.2, weight: 10, impact: 'neutral', trend: 'up', description: '차세대 배터리 상용화 경쟁 심화', sectorRelevance: '기술 주도권' },
  ],
};

const mockKakao: AnalysisResult = {
  company: { name: '카카오', ticker: '035720', price: 43450, priceChange: -350, priceChangePercent: -0.80, marketCap: 19300000000000, per: 38.5, pbr: 1.8, peg: 1.42, psr: 2.1, roe: 4.7, roa: 2.1, debtRatio: 88.2, dividendYield: 0.1, market: 'KOSPI' },
  sector: { major: '정보기술', middle: 'IT서비스', minor: '플랫폼/SNS', detail: '메신저·금융·커머스', trendCategories: ['AI 플랫폼', '카카오페이', '카카오뱅크', '콘텐츠', '핀테크'] },
  hotReasons: [
    { type: 'valuation', title: '밸류에이션 시그널', strength: 72, keyMetrics: [{ label: 'PBR', value: '1.8x (역대 최저 수준)' }, { label: '목표주가 대비', value: '현재가 대비 50%+ 업사이드' }, { label: '시가총액', value: '1.9조원 (최고점 대비 -75%)' }], interpretation: 'PBR 역대 최저, 실적 대비 극저평가. 거버넌스 이슈 해소 시 강한 재평가 기대.' },
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 75, keyMetrics: [{ label: '카나나 LLM', value: '자체 AI 모델 출시 준비' }, { label: '카카오톡 월 DAU', value: '4,800만명 (국민 플랫폼)' }, { label: 'AI 서비스', value: 'AI 이미지·챗봇 서비스 확대' }], interpretation: '국민 메신저 기반 AI 플랫폼 전환. 자체 LLM으로 AI 수익화 기대.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 58, keyMetrics: [{ label: '광고 수익', value: '카카오톡 비즈보드 성장세 회복' }, { label: '핀테크 수익', value: '카카오페이·뱅크 흑자 전환' }, { label: 'B2B AI', value: '기업 AI 솔루션 수주 증가' }], interpretation: '광고+핀테크+AI B2B의 트리플 성장 드라이버 확보.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 62, keyMetrics: [{ label: '거버넌스 개선', value: '신임 경영진 쇄신 작업 진행 중' }, { label: '비핵심 자산 매각', value: '해외 계열사 정리로 현금 확보' }, { label: '컨센서스 목표가', value: '65,000원 (현재 대비 +50%)' }], interpretation: '거버넌스 이슈 해소와 비핵심 정리가 주가 회복의 핵심 촉매.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 48, keyMetrics: [{ label: '외국인 지분율', value: '22.8% (저점 근접)' }, { label: '기관 순매수', value: '최근 1개월 +820억원' }, { label: '공매도 비율', value: '2.8%' }], interpretation: '기관 저점 매수 유입. 거버넌스 이슈로 외국인 지분 감소 후 저점 근접.' },
  ],
  valuation: [
    { type: 'PER', value: 38.5, benchmark: 35.0, signal: 'neutral', description: '플랫폼 기업 프리미엄 반영. 성장률 회복 시 재평가 여지.' },
    { type: 'Forward PER', value: 24.8, benchmark: 30.0, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 24.8x. 플랫폼 기업 대비 저평가.' },
    { type: 'PBR', value: 1.8, benchmark: 3.0, signal: 'bullish', description: 'PBR 역대 최저 수준. 브랜드·플랫폼 가치 미반영 극저평가.' },
    { type: 'PEG', value: 1.42, benchmark: 1.5, signal: 'neutral', description: 'PEG 1.42로 성장성 반영 시 합리적.' },
    { type: 'ROE', value: 4.7, benchmark: 8.0, signal: 'bearish', description: 'ROE 개선 필요. 수익성 강화 전략 필수.' },
  ],
  chartData: generateChartData(48000, kakaoEvents),
  competitors: [
    { name: '카카오', ticker: '035720', marketShare: 35.2, rdRate: 8.5, roa: 2.1, debtRatio: 88.2, keyAdvantage: '국민 메신저 플랫폼' },
    { name: '네이버', ticker: '035420', marketShare: 38.5, rdRate: 12.1, roa: 5.8, debtRatio: 52.1, keyAdvantage: '검색·커머스 1위' },
    { name: 'Meta', ticker: 'META', marketShare: 8.2, rdRate: 18.5, roa: 22.3, debtRatio: 28.4, keyAdvantage: 'AI+소셜 시너지' },
  ],
  bullBear: [
    { case: 'bull', probability: 55, points: ['PBR 역대 최저 + 거버넌스 개선으로 디스카운트 해소', '자체 LLM 카나나 출시로 AI 플랫폼 수익화', '카카오페이·뱅크 흑자 전환으로 핀테크 가치 현실화', '비핵심 계열사 정리로 사업 집중 및 현금 확보', '카카오톡 4,800만 DAU 기반 광고 성장'], targetPriceChange: 50 },
    { case: 'bear', probability: 45, points: ['거버넌스 이슈 장기화로 경영진 불확실성 지속', '네이버와의 플랫폼 경쟁 심화', 'AI 서비스 수익화 시점 불투명', '카카오페이·픽코마 등 계열사 적자 부담', '망 사용료 등 규제 리스크'], targetPriceChange: -25 },
  ],
  entryTiming: { signal: 'buy', confidence: 58, supportLevel: 40000, resistanceLevel: 48000, targetPrice: 65000, stopLoss: 36000, reasoning: '역대 최저 PBR 구간 진입. 거버넌스 개선 기대감으로 저점 매수 매력. 분할 매수로 리스크 관리.' },
  macro: [
    { name: '디지털 광고 시장', value: 6.8, weight: 30, impact: 'positive', trend: 'up', description: '국내 디지털 광고 시장 성장 지속', sectorRelevance: '광고 매출 직결' },
    { name: '핀테크 규제 환경', value: 5.5, weight: 20, impact: 'neutral', trend: 'stable', description: '금융 당국 핀테크 규제 명확화', sectorRelevance: '카카오페이·뱅크' },
    { name: 'AI 플랫폼 경쟁', value: 7.2, weight: 20, impact: 'neutral', trend: 'up', description: '국내외 AI 서비스 경쟁 심화', sectorRelevance: 'AI 수익화' },
    { name: '소비 심리 지수', value: 5.9, weight: 15, impact: 'neutral', trend: 'stable', description: '내수 소비 회복 더딤', sectorRelevance: '카카오커머스' },
    { name: '정부 플랫폼 규제', value: 6.8, weight: 15, impact: 'negative', trend: 'up', description: '플랫폼 독과점 규제 강화 추세', sectorRelevance: '사업 제약 리스크' },
  ],
};

const mockKBFinancial: AnalysisResult = {
  company: { name: 'KB금융', ticker: '105560', price: 88500, priceChange: 1200, priceChangePercent: 1.37, marketCap: 36200000000000, per: 7.8, pbr: 0.72, peg: 0.62, psr: 1.2, roe: 9.3, roa: 0.68, debtRatio: 1250.5, dividendYield: 5.2, market: 'KOSPI' },
  sector: { major: '금융', middle: '은행', minor: '종합금융그룹', detail: '시중은행·증권·보험', trendCategories: ['금리 인하 사이클', '주주환원', '밸류업 프로그램', '디지털금융', '글로벌 확장'] },
  hotReasons: [
    { type: 'valuation', title: '밸류에이션 시그널', strength: 88, keyMetrics: [{ label: 'PBR', value: '0.72x (은행주 할인 극대화)' }, { label: '배당수익률', value: '5.2% (시중금리 대비 매력적)' }, { label: '밸류업 목표', value: 'PBR 1.0x 달성 계획' }], interpretation: '정부 밸류업 프로그램과 자체 PBR 1배 달성 계획으로 강한 재평가 모멘텀.' },
    { type: 'fundamental', title: '펀더멘탈 변화 시그널', strength: 82, keyMetrics: [{ label: '연간 순이익', value: '4.9조원 (역대 최대)' }, { label: 'ROE', value: '9.3% (은행 업계 최고)' }, { label: '주주환원율', value: '35% → 50% 확대 계획' }], interpretation: '역대 최대 실적 + 주주환원 확대로 배당 + 주가 상승 이중 수혜.' },
    { type: 'insider', title: '내부자거래 시그널', strength: 75, keyMetrics: [{ label: '자사주 매입', value: '2024년 5,000억원 매입 계획' }, { label: '외국인 지분율', value: '65.8% (고지분)' }, { label: '기관 순매수', value: '최근 1개월 +1,900억원' }], interpretation: '대규모 자사주 매입 + 외국인 고지분율은 글로벌 기관의 강한 신뢰.' },
    { type: 'news', title: '뉴스/이벤트 시그널', strength: 79, keyMetrics: [{ label: '밸류업 지수 편입', value: '코리아 밸류업 지수 편입 확정' }, { label: '배당 정책', value: '분기 배당 + 연간 배당 증가 기조' }, { label: '컨센서스 목표가', value: '110,000원 (현재 대비 +24%)' }], interpretation: '정부 밸류업 프로그램의 최대 수혜주. 코리아 디스카운트 해소 선두.' },
    { type: 'tech', title: '기술/산업 혁신 시그널', strength: 63, keyMetrics: [{ label: 'KB스타뱅킹 MAU', value: '1,800만 (디지털 1위)' }, { label: 'AI 리스크 관리', value: 'AI 기반 여신 심사 도입' }, { label: '글로벌 진출', value: '동남아·캄보디아 확장' }], interpretation: '디지털 금융 1위 + 글로벌 확장으로 성장 다각화.' },
  ],
  valuation: [
    { type: 'PER', value: 7.8, benchmark: 9.0, signal: 'bullish', description: '은행 섹터 평균 대비 저평가. 실적 안정성 대비 할인 과도.' },
    { type: 'Forward PER', value: 7.2, benchmark: 8.5, signal: 'bullish', description: '2025년 예상 실적 기준 Forward PER 7.2x. 배당과 함께 매력적.' },
    { type: 'PBR', value: 0.72, benchmark: 1.0, signal: 'bullish', description: 'PBR 0.72x. 밸류업 프로그램 목표 PBR 1.0x 달성 시 39% 업사이드.' },
    { type: 'PEG', value: 0.62, benchmark: 1.0, signal: 'bullish', description: 'PEG 0.62로 성장성 대비 극저평가. 주주환원 강화 감안 시 더욱 매력적.' },
    { type: 'ROE', value: 9.3, benchmark: 8.5, signal: 'bullish', description: 'ROE 9.3%로 은행 업계 최고 수준. 수익성 우수.' },
  ],
  chartData: generateChartData(70000, kbEvents),
  competitors: [
    { name: 'KB금융', ticker: '105560', marketShare: 18.5, rdRate: 1.2, roa: 0.68, debtRatio: 1250.5, keyAdvantage: 'ROE 1위' },
    { name: '신한지주', ticker: '055550', marketShare: 17.2, rdRate: 1.1, roa: 0.65, debtRatio: 1180.2, keyAdvantage: '글로벌 진출' },
    { name: '하나금융지주', ticker: '086790', marketShare: 14.8, rdRate: 0.9, roa: 0.61, debtRatio: 1220.8, keyAdvantage: '외환 강점' },
  ],
  bullBear: [
    { case: 'bull', probability: 68, points: ['정부 밸류업 프로그램으로 PBR 1배 달성 압박', '배당수익률 5.2% + 자사주 소각으로 총주주환원율 50% 목표', '역대 최대 순이익 + 안정적 이익 체력', '금리 인하 사이클 진입 시 대출 수요 회복', '코리아 디스카운트 해소의 대표 수혜주'], targetPriceChange: 30 },
    { case: 'bear', probability: 32, points: ['금리 인하 시 NIM 하락으로 이자이익 감소', '부동산 PF 리스크 잔존', '홍콩 ELS 손실 관련 소송 리스크', '글로벌 경기 침체 시 대손충당금 증가', '핀테크 기업과의 경쟁 심화'], targetPriceChange: -18 },
  ],
  entryTiming: { signal: 'buy', confidence: 75, supportLevel: 80000, resistanceLevel: 95000, targetPrice: 110000, stopLoss: 74000, reasoning: '배당수익률 5.2% + 밸류업 모멘텀 + PBR 0.72x 저평가 삼박자. 안정적 수익 추구 투자자의 최적 선택.' },
  macro: [
    { name: '한국은행 기준금리', value: 3.25, weight: 30, impact: 'neutral', trend: 'stable', description: '금리 동결 → 인하 전환 기대', sectorRelevance: 'NIM 및 대출 수요' },
    { name: '가계부채 수준', value: 5.8, weight: 25, impact: 'negative', trend: 'stable', description: 'GDP 대비 가계부채 105% 수준', sectorRelevance: '대출 성장 제약' },
    { name: '밸류업 프로그램', value: 8.5, weight: 20, impact: 'positive', trend: 'up', description: '정부 기업 밸류업 지원 방안 본격화', sectorRelevance: 'PBR 재평가 촉매' },
    { name: '부동산 경기', value: 5.2, weight: 15, impact: 'neutral', trend: 'stable', description: '부동산 PF 리스크 점진적 해소', sectorRelevance: '충당금 부담' },
    { name: '외국인 투자 유입', value: 6.8, weight: 10, impact: 'positive', trend: 'up', description: '밸류업 기대로 외국인 매수 증가', sectorRelevance: '수급 개선' },
  ],
};

// ── Company registry ────────────────────────────────────────────────────────

const COMPANY_DATABASE: { [key: string]: AnalysisResult } = {
  'SK하이닉스': mockSKHynix,
  '000660': mockSKHynix,
  '삼성전자': mockSamsung,
  '005930': mockSamsung,
  '현대차': mockHyundai,
  '005380': mockHyundai,
  '셀트리온': mockCelltrion,
  '068270': mockCelltrion,
  'LG에너지솔루션': mockLGEnergy,
  '373220': mockLGEnergy,
  '카카오': mockKakao,
  '035720': mockKakao,
  'KB금융': mockKBFinancial,
  '105560': mockKBFinancial,
};

function buildGenericResult(name: string): AnalysisResult {
  return {
    ...mockSKHynix,
    company: { ...mockSKHynix.company, name },
    sector: { major: '기타', middle: '기타', minor: '기타', detail: '기타', trendCategories: [] },
  };
}

export async function searchCompany(name: string): Promise<AnalysisResult> {
  try {
    const response = await apiClient.get(`/company/${encodeURIComponent(name)}`);
    return response.data;
  } catch {
    await new Promise(r => setTimeout(r, 800));
    const trimmed = name.trim();
    if (COMPANY_DATABASE[trimmed]) {
      return COMPANY_DATABASE[trimmed];
    }
    // Partial match
    for (const key of Object.keys(COMPANY_DATABASE)) {
      if (trimmed.includes(key) || key.includes(trimmed)) {
        return COMPANY_DATABASE[key];
      }
    }
    return buildGenericResult(trimmed);
  }
}

export async function getMacroData(_sector: string): Promise<MacroIndicator[]> {
  try {
    const response = await apiClient.get(`/macro/${encodeURIComponent(_sector)}`);
    return response.data;
  } catch {
    return [];
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
