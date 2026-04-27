import type { AnalysisResult } from '../../types'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  analysisResult: AnalysisResult
}

export default function OpinionTab({ analysisResult }: Props) {
  const { bullBear, entryTiming } = analysisResult
  const bull = bullBear.find((b) => b.case === 'bull')!
  const bear = bullBear.find((b) => b.case === 'bear')!

  const signalColor = entryTiming.signal === 'buy' ? 'text-green-400' : entryTiming.signal === 'avoid' ? 'text-red-400' : 'text-yellow-400'
  const signalBg = entryTiming.signal === 'buy' ? 'bg-green-900' : entryTiming.signal === 'avoid' ? 'bg-red-900' : 'bg-yellow-900'
  const signalLabel = entryTiming.signal === 'buy' ? '매수 신호' : entryTiming.signal === 'avoid' ? '매수 회피' : '관망'

  const fmt = (n: number) => n.toLocaleString('ko-KR')

  return (
    <div className="space-y-6">
      {/* Bull / Bear */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bull */}
        <div className="bg-gray-800 border border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-green-400 font-semibold text-sm">Bull Case</span>
            <span className="ml-auto text-xs text-gray-400">확률 {bull.probability}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${bull.probability}%` }} />
          </div>
          <ul className="space-y-1.5">
            {bull.points.map((p, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-green-500 shrink-0">▲</span>{p}</li>
            ))}
          </ul>
          <div className="mt-3 text-sm font-semibold text-green-400">목표 상승률: +{bull.targetPriceChange}%</div>
        </div>

        {/* Bear */}
        <div className="bg-gray-800 border border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-red-400 font-semibold text-sm">Bear Case</span>
            <span className="ml-auto text-xs text-gray-400">확률 {bear.probability}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${bear.probability}%` }} />
          </div>
          <ul className="space-y-1.5">
            {bear.points.map((p, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-red-500 shrink-0">▼</span>{p}</li>
            ))}
          </ul>
          <div className="mt-3 text-sm font-semibold text-red-400">목표 하락률: {bear.targetPriceChange}%</div>
        </div>
      </div>

      {/* Entry timing */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">매수 타이밍 신호</h3>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded text-sm font-bold ${signalBg} ${signalColor}`}>{signalLabel}</span>
          <span className="text-xs text-gray-400">신뢰도 {entryTiming.confidence}%</span>
          <div className="flex-1 bg-gray-700 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${entryTiming.signal === 'buy' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${entryTiming.confidence}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">목표가</div>
            <div className="text-sm font-bold text-blue-400">{fmt(entryTiming.targetPrice)}원</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">지지선</div>
            <div className="text-sm font-bold text-green-400">{fmt(entryTiming.supportLevel)}원</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">저항선</div>
            <div className="text-sm font-bold text-yellow-400">{fmt(entryTiming.resistanceLevel)}원</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">손절선</div>
            <div className="text-sm font-bold text-red-400">{fmt(entryTiming.stopLoss)}원</div>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{entryTiming.reasoning}</p>
      </div>
    </div>
  )
}
