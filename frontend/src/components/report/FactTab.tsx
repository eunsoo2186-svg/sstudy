import type { AnalysisResult, HotReason, ValuationSignal } from '../../types'

interface Props {
  analysisResult: AnalysisResult
  onCompanyClick: (name: string) => void
}

function StrengthBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{value}</span>
    </div>
  )
}

function HotReasonCard({ reason }: { reason: HotReason }) {
  const typeLabel: Record<HotReason['type'], string> = {
    valuation: '밸류에이션', insider: '내부자거래', tech: '기술/산업', fundamental: '펀더멘탈', news: '뉴스/이벤트'
  }
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">{typeLabel[reason.type]}</span>
        <span className="text-xs text-gray-400">신호 강도</span>
      </div>
      <h4 className="text-sm font-semibold text-white mb-2">{reason.title}</h4>
      <StrengthBar value={reason.strength} />
      <div className="mt-3 space-y-1">
        {reason.keyMetrics.map((m, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-gray-400">{m.label}</span>
            <span className="text-gray-200 text-right ml-2">{m.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400 leading-relaxed border-t border-gray-700 pt-2">{reason.interpretation}</p>
    </div>
  )
}

function signalColor(signal: ValuationSignal['signal']) {
  if (signal === 'bullish') return 'text-green-400'
  if (signal === 'bearish') return 'text-red-400'
  return 'text-yellow-400'
}

export default function FactTab({ analysisResult, onCompanyClick }: Props) {
  const { hotReasons, valuation, competitors, company } = analysisResult
  return (
    <div className="space-y-6">
      {/* Why hot */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">왜 지금 핫한가?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hotReasons.map((r, i) => <HotReasonCard key={i} reason={r} />)}
        </div>
      </section>

      {/* Valuation table */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">밸류에이션 분석</h3>
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-gray-400">지표</th>
                <th className="text-right p-3 text-gray-400">현재값</th>
                <th className="text-right p-3 text-gray-400">섹터평균</th>
                <th className="text-left p-3 text-gray-400">시그널</th>
                <th className="text-left p-3 text-gray-400 hidden sm:table-cell">설명</th>
              </tr>
            </thead>
            <tbody>
              {valuation.map((v, i) => (
                <tr key={i} className="border-b border-gray-700 last:border-0">
                  <td className="p-3 font-semibold text-white">{v.type}</td>
                  <td className={`p-3 text-right ${signalColor(v.signal)}`}>{v.value}</td>
                  <td className="p-3 text-right text-gray-400">{v.benchmark}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${v.signal === 'bullish' ? 'bg-green-900 text-green-300' : v.signal === 'bearish' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                      {v.signal === 'bullish' ? '저평가' : v.signal === 'bearish' ? '고평가' : '중립'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 hidden sm:table-cell">{v.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Competitors */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">동종업계 비교</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {competitors.map((c, i) => (
            <button
              key={i}
              onClick={() => onCompanyClick(c.name)}
              className={`text-left bg-gray-800 border rounded-lg p-3 hover:border-blue-500 transition-colors ${c.ticker === company.ticker ? 'border-blue-500' : 'border-gray-700'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">{c.name}</span>
                <span className="text-xs text-gray-500">{c.ticker}</span>
              </div>
              <div className="text-xs text-gray-400">점유율 {c.marketShare}%</div>
              <div className="text-xs text-gray-500 mt-1">{c.keyAdvantage}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Trend categories */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 mb-3">관련 트렌드</h3>
        <div className="flex flex-wrap gap-2">
          {analysisResult.sector.trendCategories.map((t, i) => (
            <span key={i} className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </section>
    </div>
  )
}
