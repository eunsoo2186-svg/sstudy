import type { AnalysisResult, MacroIndicator } from '../../types'
import MacroCard from './MacroCard'
import { getMacroData } from '../../api/client'
import { useEffect, useState } from 'react'

interface Props {
  analysisResult: AnalysisResult | null
}

export default function MacroTab({ analysisResult }: Props) {
  const [indicators, setIndicators] = useState<MacroIndicator[]>([])

  useEffect(() => {
    const sector = analysisResult?.sector.middle ?? '반도체'
    getMacroData(sector).then(setIndicators).catch(console.error)
  }, [analysisResult])

  const data = indicators.length > 0 ? indicators : analysisResult?.macro ?? []

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-white mb-4">매크로 지표</h2>
      {data.length === 0 && (
        <p className="text-gray-400 text-sm">종목을 검색하면 관련 매크로 지표가 표시됩니다.</p>
      )}
      <div className="space-y-3">
        {data.map((indicator, i) => <MacroCard key={i} indicator={indicator} />)}
      </div>
    </div>
  )
}
