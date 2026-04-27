import { useStore } from '../../store'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  onCompanyClick: (name: string) => void
}

export default function WatchlistTab({ onCompanyClick }: Props) {
  const { watchlist, removeFromWatchlist, analysisResult, addToWatchlist } = useStore()

  const handleAdd = () => {
    if (analysisResult) {
      addToWatchlist({
        ticker: analysisResult.company.ticker,
        name: analysisResult.company.name,
        price: analysisResult.company.price,
        priceChangePercent: analysisResult.company.priceChangePercent,
      })
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">워치리스트</h2>
        {analysisResult && (
          <button
            onClick={handleAdd}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-1"
          >
            + {analysisResult.company.name} 추가
          </button>
        )}
      </div>

      {watchlist.length === 0 && (
        <div className="text-gray-400 text-sm text-center py-12">
          <p>워치리스트가 비어있습니다.</p>
          <p className="mt-1 text-gray-500">종목 분석 후 추가하거나, 리포트 탭에서 '워치리스트' 버튼을 누르세요.</p>
        </div>
      )}

      <div className="space-y-2">
        {watchlist.map((item) => {
          const isPositive = item.priceChangePercent >= 0
          return (
            <div
              key={item.ticker}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center gap-4 hover:border-gray-600 transition-colors"
            >
              <button
                onClick={() => onCompanyClick(item.name)}
                className="flex-1 flex items-center gap-4 text-left"
              >
                <div className="flex-1">
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.ticker}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{item.price.toLocaleString('ko-KR')}원</div>
                  <div className={`text-xs flex items-center gap-0.5 justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isPositive ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
                  </div>
                </div>
              </button>
              <button
                onClick={() => removeFromWatchlist(item.ticker)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
