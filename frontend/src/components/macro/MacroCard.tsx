import type { MacroIndicator } from '../../types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  indicator: MacroIndicator
}

export default function MacroCard({ indicator }: Props) {
  const impactColor = indicator.impact === 'positive' ? 'text-green-400' : indicator.impact === 'negative' ? 'text-red-400' : 'text-yellow-400'
  const impactBg = indicator.impact === 'positive' ? 'bg-green-900' : indicator.impact === 'negative' ? 'bg-red-900' : 'bg-yellow-900'
  const impactLabel = indicator.impact === 'positive' ? '긍정' : indicator.impact === 'negative' ? '부정' : '중립'

  const TrendIcon = indicator.trend === 'up' ? TrendingUp : indicator.trend === 'down' ? TrendingDown : Minus
  const trendColor = indicator.trend === 'up' ? 'text-green-400' : indicator.trend === 'down' ? 'text-red-400' : 'text-gray-400'

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white">{indicator.name}</h3>
            <TrendIcon size={14} className={trendColor} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{indicator.value}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${impactBg} ${impactColor}`}>{impactLabel}</span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{indicator.sectorRelevance}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-400 mb-1">가중치</div>
          <div className="text-sm font-bold text-white">{indicator.weight}%</div>
        </div>
      </div>
      {/* Weight bar */}
      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full ${indicator.impact === 'positive' ? 'bg-green-500' : indicator.impact === 'negative' ? 'bg-red-500' : 'bg-yellow-500'}`}
          style={{ width: `${Math.min(indicator.weight * 4, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{indicator.description}</p>
    </div>
  )
}
