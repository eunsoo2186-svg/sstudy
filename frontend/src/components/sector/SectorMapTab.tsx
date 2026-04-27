import { useState } from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useStore } from '../../store'

interface SectorNode {
  label: string
  children?: SectorNode[]
  ticker?: string
}

const SECTOR_TREE: SectorNode[] = [
  {
    label: 'IT / 기술',
    children: [
      {
        label: '반도체',
        children: [
          { label: '메모리', children: [{ label: 'SK하이닉스', ticker: '000660' }, { label: '삼성전자', ticker: '005930' }] },
          { label: '시스템반도체', children: [{ label: '삼성전자', ticker: '005930' }] },
          { label: '반도체장비·소재', children: [{ label: '동부', ticker: '005260' }] },
        ],
      },
      { label: '디스플레이', children: [{ label: 'LG디스플레이', ticker: '034220' }] },
      { label: 'IT서비스', children: [{ label: '카카오', ticker: '035720' }, { label: '네이버', ticker: '035420' }, { label: '쿠팡', ticker: 'CPNG' }] },
      { label: '전자', children: [{ label: '삼성전자', ticker: '005930' }, { label: 'LG전자', ticker: '066570' }] },
    ],
  },
  {
    label: '자동차',
    children: [
      { label: '완성차', children: [{ label: '현대차', ticker: '005380' }, { label: '기아', ticker: '000270' }] },
      { label: '자동차부품', children: [{ label: '현대모비스', ticker: '012330' }, { label: '만도', ticker: '204320' }] },
      { label: '배터리', children: [{ label: '삼성SDI', ticker: '006400' }, { label: 'LG에너지솔루션', ticker: '373220' }, { label: 'SK이노베이션', ticker: '096770' }] },
    ],
  },
  {
    label: '에너지 / 유틸리티',
    children: [
      { label: '전력', children: [{ label: '한전', ticker: '015760' }] },
      { label: '가스', children: [{ label: '한국가스공사', ticker: '036460' }] },
      { label: '신재생에너지', children: [{ label: '두산에너빌리티', ticker: '034020' }] },
      { label: '석유·정유', children: [] },
    ],
  },
  {
    label: '금융',
    children: [
      { label: '은행', children: [{ label: 'KB금융', ticker: '105560' }, { label: '우리금융', ticker: '316140' }, { label: '신한지주', ticker: '055550' }, { label: '하나금융지주', ticker: '086790' }] },
      { label: '보험', children: [{ label: '삼성화재', ticker: '000810' }, { label: '한화생명', ticker: '088350' }] },
      { label: '증권', children: [{ label: '삼성증권', ticker: '016360' }] },
    ],
  },
  {
    label: '헬스케어 / 바이오',
    children: [
      { label: '의약', children: [{ label: '셀트리온', ticker: '068270' }, { label: '유한양행', ticker: '000100' }] },
      { label: '바이오', children: [{ label: '삼성바이오로직스', ticker: '207940' }] },
      { label: '의료기기', children: [{ label: '오스템임플란트', ticker: '048260' }] },
    ],
  },
  {
    label: '화학 / 소재',
    children: [
      { label: '화학', children: [{ label: '롯데케미칼', ticker: '011170' }, { label: 'LG화학', ticker: '051910' }] },
      { label: '철강', children: [{ label: 'POSCO홀딩스', ticker: '005490' }, { label: '현대제철', ticker: '004020' }] },
    ],
  },
  {
    label: '소비재',
    children: [
      { label: '식품', children: [{ label: '농심', ticker: '004370' }, { label: 'CJ제일제당', ticker: '097950' }] },
      { label: '음료', children: [{ label: '롯데칠성음료', ticker: '005300' }] },
      { label: '임의소비재', children: [{ label: '현대백화점', ticker: '069960' }] },
    ],
  },
  {
    label: '통신',
    children: [
      { label: '통신서비스', children: [{ label: 'SK텔레콤', ticker: '017670' }, { label: 'KT', ticker: '030200' }, { label: 'LG유플러스', ticker: '032640' }] },
    ],
  },
]

interface Props {
  onCompanyClick: (name: string) => void
}

export default function SectorMapTab({ onCompanyClick }: Props) {
  const [path, setPath] = useState<SectorNode[]>([])
  const { analysisResult } = useStore()
  const currentTicker = analysisResult?.company.ticker

  const currentLevel = path.length === 0 ? SECTOR_TREE : path[path.length - 1].children ?? []

  const crumbs = [{ label: '전체' }, ...path]

  const handleNodeClick = (node: SectorNode) => {
    if (node.ticker) {
      onCompanyClick(node.label)
      return
    }
    if (node.children && node.children.length > 0) {
      setPath([...path, node])
    }
  }

  const navigateTo = (idx: number) => {
    if (idx === 0) { setPath([]); return }
    setPath(path.slice(0, idx))
  }

  const isCompany = (node: SectorNode) => !!node.ticker

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-4">섹터 맵</h2>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-gray-500" />}
            <button
              onClick={() => navigateTo(i)}
              className={`text-sm px-2 py-0.5 rounded hover:bg-gray-700 transition-colors ${i === crumbs.length - 1 ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}
            >
              {i === 0 ? <Home size={14} /> : c.label}
            </button>
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {currentLevel.map((node, i) => {
          const isCurrentCompany = node.ticker === currentTicker
          return (
            <button
              key={i}
              onClick={() => handleNodeClick(node)}
              className={`p-4 rounded-lg border text-left transition-all hover:scale-105 ${
                isCompany(node)
                  ? isCurrentCompany
                    ? 'bg-blue-900 border-blue-500 text-blue-200'
                    : 'bg-gray-800 border-blue-700 hover:border-blue-500'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className={`font-semibold text-sm ${isCompany(node) ? (isCurrentCompany ? 'text-blue-200' : 'text-blue-300') : 'text-white'}`}>
                {node.label}
              </div>
              {node.ticker && <div className="text-xs text-gray-400 mt-1">{node.ticker}</div>}
              {!isCompany(node) && node.children && node.children.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">{node.children.length}개 하위</div>
              )}
              {isCurrentCompany && <div className="text-xs text-blue-400 mt-1">분석 중</div>}
            </button>
          )
        })}
      </div>

      {currentLevel.length === 0 && (
        <div className="text-gray-500 text-sm mt-4">하위 항목이 없습니다.</div>
      )}
    </div>
  )
}
