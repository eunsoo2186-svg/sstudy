import { useState } from 'react'
import type { AnalysisResult } from '../../types'
import ConceptCard from './ConceptCard'

interface Props {
  analysisResult: AnalysisResult | null
}

interface Concept {
  id: string
  tag: '밸류에이션' | '매크로' | '섹터' | '성장성' | '리스크'
  question: string
  explanation: string
}

const CONCEPTS: Record<string, Concept[]> = {
  반도체: [
    { id: 'semi-1', tag: '밸류에이션', question: 'PEG ratio란 무엇이고 어떻게 활용하나', explanation: 'PEG(Price/Earnings to Growth)는 PER을 이익성장률로 나눈 지표입니다. PEG 1 미만이면 성장성 대비 저평가로 해석합니다.' },
    { id: 'semi-2', tag: '섹터', question: '반도체 업황 사이클이란', explanation: '반도체는 수급 불균형에 따른 3-4년 주기의 업사이클/다운사이클이 반복됩니다. 현재 사이클 위치 파악이 투자의 핵심입니다.' },
    { id: 'semi-3', tag: '성장성', question: '커스텀 AI칩 vs 범용 GPU 차이', explanation: 'NVIDIA GPU는 범용 연산에 최적화, 반면 Google TPU/Apple NPU 등은 특정 AI 모델에 최적화됩니다. 맞춤형 칩은 효율이 높지만 범용성이 낮습니다.' },
    { id: 'semi-4', tag: '밸류에이션', question: 'Forward PER로 고평가 판단하는 법', explanation: 'Forward PER은 미래 예상 EPS 기준 PER입니다. 섹터 평균 대비 낮으면 저평가, 높으면 고평가 신호로 해석합니다.' },
    { id: 'semi-5', tag: '리스크', question: '수출규제가 반도체 기업에 미치는 영향', explanation: '미국의 대중국 반도체 수출규제는 중국 매출 직접 타격과 글로벌 공급망 재편을 야기합니다. SK하이닉스의 중국 매출 비중은 약 30%입니다.' },
    { id: 'semi-6', tag: '매크로', question: '내부자 매매가 투자 신호가 되는 이유', explanation: '경영진은 자사 정보에 가장 정통합니다. 내부자 대규모 매수는 향후 실적 자신감, 매도는 고점 인식 신호로 해석합니다.' },
  ],
  금융: [
    { id: 'fin-1', tag: '밸류에이션', question: 'NIM(순이자마진)이 은행 수익성에 미치는 영향', explanation: 'NIM은 대출이자율에서 예금이자율을 뺀 순이자마진입니다. 금리 상승기에는 NIM 확대로 은행 수익성이 개선됩니다.' },
    { id: 'fin-2', tag: '밸류에이션', question: 'PBR 1배 미만의 의미', explanation: 'PBR 1배 미만은 주가가 장부가치(순자산)보다 낮다는 의미입니다. 은행주는 구조적 저PBR 경향이 있으나 ROE 개선 시 재평가됩니다.' },
    { id: 'fin-3', tag: '리스크', question: '대손충당금과 연체율 모니터링 방법', explanation: '대손충당금은 부실채권에 대비한 비용입니다. 연체율 상승 → 충당금 증가 → 순이익 감소로 이어집니다.' },
    { id: 'fin-4', tag: '매크로', question: '금리 사이클과 은행주 주가 패턴', explanation: '금리 인상기 초반: NIM 확대로 긍정적. 후반: 경기 둔화, 연체율 상승 우려로 부정적. 금리 인하기: NIM 축소 우려.' },
    { id: 'fin-5', tag: '섹터', question: 'BIS 자기자본비율이란', explanation: 'BIS 비율은 위험가중자산 대비 자기자본 비율입니다. 국제 기준 8% 이상, 한국 규제 기준 10.5% 이상 유지 필요합니다.' },
    { id: 'fin-6', tag: '성장성', question: '배당수익률로 금융주 평가하는 법', explanation: '금융주는 배당 성향이 높아 배당수익률이 중요합니다. 은행주 평균 배당수익률 5-7%가 일반적 평가 기준입니다.' },
  ],
  default: [
    { id: 'bio-1', tag: '섹터', question: '임상 단계 (1/2/3상)가 주가에 미치는 영향', explanation: '임상 1상: 안전성 확인(소규모), 2상: 효능 확인(중규모), 3상: 대규모 통계적 유효성 확인. 3상 성공 시 주가 급등, 실패 시 급락합니다.' },
    { id: 'bio-2', tag: '성장성', question: '바이오 기업은 왜 적자여도 주가가 오르나', explanation: '바이오는 파이프라인의 미래가치로 평가됩니다. FDA 허가 기대감, 기술이전 가능성 등 옵션가치가 현재 적자를 상쇄합니다.' },
    { id: 'bio-3', tag: '밸류에이션', question: '바이오 섹터 PER 대신 PSR을 쓰는 이유', explanation: '적자 기업은 EPS가 없어 PER 산출이 불가합니다. PSR(주가/매출)로 성장성과 규모를 상대 평가합니다.' },
    { id: 'bio-4', tag: '리스크', question: 'FDA 허가 프로세스 이해', explanation: 'FDA 허가는 신약의 미국 시장 진입 관문입니다. IND 신청 → 임상 1/2/3상 → NDA 제출 → 심사(10개월) → 승인/거절 단계를 거칩니다.' },
    { id: 'bio-5', tag: '섹터', question: '기술이전 계약 구조와 마일스톤', explanation: '계약금(Up-front) + 개발 단계별 마일스톤 + 로열티로 구성됩니다. 마일스톤 달성 공시가 주가 모멘텀의 핵심입니다.' },
    { id: 'bio-6', tag: '매크로', question: '오리지널 vs 바이오시밀러 차이', explanation: '오리지널은 특허 보유 신약, 바이오시밀러는 특허 만료 후 복제 생물의약품입니다. 바이오시밀러는 가격 경쟁력이 높지만 마진이 낮습니다.' },
  ],
}

type Level = '모름' | '어렴풋이' | '이해함'

function getSectorKey(middle?: string): string {
  if (!middle) return 'default'
  if (middle.includes('반도체')) return '반도체'
  if (middle.includes('금융') || middle.includes('은행')) return '금융'
  return 'default'
}

const STORAGE_KEY = 'stocklens-understanding'

function loadUnderstanding(): Record<string, Level> {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

export default function LearningNotesTab({ analysisResult }: Props) {
  const [understanding, setUnderstanding] = useState<Record<string, Level>>(loadUnderstanding)
  const sectorKey = getSectorKey(analysisResult?.sector.middle)
  const concepts = CONCEPTS[sectorKey] ?? CONCEPTS.default
  const companyName = analysisResult?.company.name ?? ''

  const setLevel = (id: string, level: Level) => {
    setUnderstanding((prev) => {
      const next = { ...prev, [id]: level }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const understood = concepts.filter((c) => understanding[c.id] === '이해함').length
  const progress = Math.round((understood / concepts.length) * 100)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white">
          학습 노트 {companyName && <span className="text-blue-400 text-base">— {companyName}</span>}
        </h2>
        <span className="text-sm text-gray-400">{understood}/{concepts.length} 이해함</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {!analysisResult && (
        <p className="text-gray-400 text-sm mb-4">종목 검색 후 해당 섹터의 학습 노트가 표시됩니다. 현재는 기본 개념 카드를 보여드립니다.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {concepts.map((c) => (
          <ConceptCard
            key={c.id}
            concept={c}
            level={understanding[c.id] ?? '모름'}
            onLevelChange={(level) => setLevel(c.id, level)}
          />
        ))}
      </div>
    </div>
  )
}
