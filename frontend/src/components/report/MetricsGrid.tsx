import type { CompanyInfo } from '../../types'

interface Props {
  company: CompanyInfo
}

function fmt(n: number, decimals = 1) {
  return n.toLocaleString('ko-KR', { maximumFractionDigits: decimals })
}

function fmtMarketCap(n: number) {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}조`
  if (n >= 1e8) return `${(n / 1e8).toFixed(0)}억`
  return n.toLocaleString('ko-KR')
}

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color ?? 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function MetricsGrid({ company }: Props) {
  const changeColor = company.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
  const perColor = company.per < 20 ? 'text-green-400' : company.per > 40 ? 'text-red-400' : 'text-yellow-400'
  const pbrColor = company.pbr < 1.5 ? 'text-green-400' : company.pbr > 3 ? 'text-red-400' : 'text-yellow-400'
  const pegColor = company.peg < 1 ? 'text-green-400' : company.peg > 2 ? 'text-red-400' : 'text-yellow-400'
  const roeColor = company.roe > 15 ? 'text-green-400' : company.roe < 5 ? 'text-red-400' : 'text-yellow-400'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricCard label="현재가" value={`${fmt(company.price, 0)}원`} sub={company.market} />
      <MetricCard label="등락률" value={`${company.priceChange >= 0 ? '+' : ''}${fmt(company.priceChangePercent)}%`} sub={`${company.priceChange >= 0 ? '+' : ''}${fmt(company.priceChange, 0)}원`} color={changeColor} />
      <MetricCard label="시가총액" value={fmtMarketCap(company.marketCap)} />
      <MetricCard label="PER" value={`${fmt(company.per)}x`} color={perColor} />
      <MetricCard label="PBR" value={`${fmt(company.pbr)}x`} color={pbrColor} />
      <MetricCard label="PEG" value={`${fmt(company.peg, 2)}`} color={pegColor} />
      <MetricCard label="PSR" value={`${fmt(company.psr)}x`} />
      <MetricCard label="ROE" value={`${fmt(company.roe)}%`} color={roeColor} />
    </div>
  )
}
