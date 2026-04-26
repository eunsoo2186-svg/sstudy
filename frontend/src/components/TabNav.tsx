type Tab = 'report' | 'macro' | 'sector' | 'notes' | 'watchlist'

interface Props {
  activeTab: Tab
  onTabChange: (t: Tab) => void
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'report', label: '📋 리포트' },
  { id: 'macro', label: '🌍 매크로' },
  { id: 'sector', label: '🗺️ 섹터 맵' },
  { id: 'notes', label: '📚 학습 노트' },
  { id: 'watchlist', label: '⭐ 워치리스트' },
]

export default function TabNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 flex gap-1 px-4 overflow-x-auto">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabChange(t.id)}
          className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
            activeTab === t.id
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  )
}
