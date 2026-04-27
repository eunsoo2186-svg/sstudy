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
    label: 'IT/기술',
    children: [
      {
        label: '반도체',
        children: [
          { label: '메모리', children: [{ label: '삼성전자', ticker: '005930' }, { label: 'SK하이닉스', ticker: '000660' }] },
          { label: '시스템반도체', children: [{ label: '퀄컴', ticker: 'QCOM' }, { label: '인텔', ticker: 'INTC' }] },
          { label: '장비', children: [] },
          { label: '소재', children: [] },
        ],
      },
      {
        label: '소프트웨어',
        children: [
          { label: '카카오', ticker: '035720' },
          { label: '네이버', ticker: '035420' },
        ],
      },
      { label: '인터넷', children: [] },
      { label: '하드웨어', children: [] },
    ],
  },
  { label: '에너지/유틸리티', children: [{ label: '석유/가스', children: [] }, { label: '신재생에너지', children: [] }] },
  { label: '금융', children: [{ label: '은행', children: [] }, { label: '증권', children: [] }, { label: '보험', children: [] }] },
  { label: '헬스케어/제약', children: [{ label: '제약', children: [] }, { label: '바이오', children: [] }, { label: '의료기기', children: [] }] },
  { label: '소비재', children: [{ label: '식품/음료', children: [] }, { label: '유통/리테일', children: [] }] },
  { label: '산업재', children: [{ label: '건설', children: [] }, { label: '기계/자동화', children: [] }] },
  { label: '소재', children: [{ label: '철강', children: [] }, { label: '화학', children: [] }] },
  { label: '통신', children: [{ label: '통신서비스', children: [] }, { label: '미디어/콘텐츠', children: [] }] },
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
