import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSearch: (q: string) => void
  isLoading: boolean
}

export default function SearchBar({ value, onChange, onSearch, isLoading }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch(value)
  }

  return (
    <div className="flex-1 max-w-xl flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
      <Search size={16} className="text-gray-400 shrink-0" />
      <input
        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
        placeholder="종목명 또는 티커 검색 (예: SK하이닉스, 005930)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <button
        onClick={() => onSearch(value)}
        disabled={isLoading}
        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50 shrink-0"
      >
        {isLoading ? '검색중...' : '분석'}
      </button>
    </div>
  )
}
