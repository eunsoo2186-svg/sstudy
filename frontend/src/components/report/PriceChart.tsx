import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'
import type { ChartDataPoint, ChartEvent } from '../../types'

interface Props {
  chartData: ChartDataPoint[]
}

type Period = '1M' | '3M' | '6M' | '1Y'

const PERIODS: { id: Period; label: string; days: number }[] = [
  { id: '1M', label: '1개월', days: 21 },
  { id: '3M', label: '3개월', days: 63 },
  { id: '6M', label: '6개월', days: 126 },
  { id: '1Y', label: '1년', days: 252 },
]

function impactColor(impact: ChartEvent['impact']) {
  if (impact === 'positive') return '#3b82f6'
  if (impact === 'negative') return '#ef4444'
  return '#f59e0b'
}

export default function PriceChart({ chartData }: Props) {
  const [period, setPeriod] = useState<Period>('6M')
  const [hoveredEvent, setHoveredEvent] = useState<ChartEvent | null>(null)

  const periodDays = PERIODS.find((p) => p.id === period)!.days
  const slicedData = chartData.slice(-periodDays)

  const eventPoints = slicedData.flatMap((d) =>
    d.events.map((e) => ({ ...e, close: d.close, date: d.date }))
  )

  const minPrice = Math.min(...slicedData.map((d) => d.close)) * 0.97
  const maxPrice = Math.max(...slicedData.map((d) => d.close)) * 1.03

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const formatPrice = (v: number) => `${(v / 1000).toFixed(0)}K`

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">주가 차트</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1 text-xs rounded transition-colors ${period === p.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event legend */}
      <div className="flex gap-3 mb-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 긍정</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 부정</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> 중립</span>
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={slicedData} margin={{ top: 20, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#9ca3af', fontSize: 11 }} interval={Math.floor(slicedData.length / 6)} />
            <YAxis domain={[minPrice, maxPrice]} tickFormatter={formatPrice} tick={{ fill: '#9ca3af', fontSize: 11 }} width={45} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af', fontSize: 11 }}
              formatter={(val) => [`${Number(val).toLocaleString('ko-KR')}원`, '종가']}
              labelFormatter={(label) => String(label)}
            />
            <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            {eventPoints.map((ep, i) => (
              <ReferenceDot
                key={i}
                x={ep.date}
                y={ep.close}
                r={6}
                fill={impactColor(ep.impact)}
                stroke="#1f2937"
                strokeWidth={1.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Event list below chart */}
      {eventPoints.length > 0 && (
        <div className="mt-3 space-y-1">
          {eventPoints.map((ep, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
              onMouseEnter={() => setHoveredEvent(ep)}
              onMouseLeave={() => setHoveredEvent(null)}
            >
              <span className="w-2 h-2 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: impactColor(ep.impact) }} />
              <span className="text-gray-400 shrink-0">{ep.date}</span>
              <span className="text-gray-200">{ep.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hovered event detail */}
      {hoveredEvent && (
        <div className="mt-2 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs">
          <div className={`font-semibold mb-1 ${hoveredEvent.impact === 'positive' ? 'text-blue-400' : hoveredEvent.impact === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>
            {hoveredEvent.title}
          </div>
          <div className="text-gray-300">{hoveredEvent.detail}</div>
          <div className="text-gray-500 mt-1">{hoveredEvent.date}</div>
        </div>
      )}
    </div>
  )
}
