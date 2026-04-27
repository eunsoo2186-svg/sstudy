import type { AnalysisResult } from '../../types'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../../store'
import SectorBreadcrumb from './SectorBreadcrumb'
import MetricsGrid from './MetricsGrid'
import PriceChart from './PriceChart'
import FactTab from './FactTab'
import OpinionTab from './OpinionTab'

interface Props {
  analysisResult: AnalysisResult | null
  isLoading: boolean
  onSearch: (q: string) => void
}

export default function ReportTab({ analysisResult, isLoading, onSearch }: Props) {
  const [factMode, setFactMode] = useState<'fact' | 'opinion'>('fact')
  const { addToWatchlist } = useStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse text-lg">분석 중...</div>
      </div>
    )
  }

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-400 text-lg">종목을 검색하면 분석 리포트가 나타납니다</p>
        <p className="text-gray-500 text-sm">예: SK하이닉스, 삼성전자, NVIDIA</p>
      </div>
    )
  }

  const { company } = analysisResult

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <SectorBreadcrumb sector={analysisResult.sector} companyName={company.name} />
        <button
          onClick={() => addToWatchlist({ ticker: company.ticker, name: company.name, price: company.price, priceChangePercent: company.priceChangePercent })}
          className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded"
        >
          <Plus size={12} /> 워치리스트
        </button>
      </div>
      <MetricsGrid company={company} />
      <PriceChart chartData={analysisResult.chartData} />
      {/* Fact/Opinion Toggle */}
      <div className="flex gap-2 border-b border-gray-700 pb-0">
        <button
          onClick={() => setFactMode('fact')}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${factMode === 'fact' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          팩트
        </button>
        <button
          onClick={() => setFactMode('opinion')}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${factMode === 'opinion' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          의견
        </button>
      </div>
      {factMode === 'fact' ? (
        <FactTab analysisResult={analysisResult} onCompanyClick={onSearch} />
      ) : (
        <OpinionTab analysisResult={analysisResult} />
      )}
    </div>
  )
}
