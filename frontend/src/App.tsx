import { useState } from 'react'
import { useStore } from './store'
import { searchCompany } from './api/client'
import SearchBar from './components/SearchBar'
import TabNav from './components/TabNav'
import ReportTab from './components/report/ReportTab'
import MacroTab from './components/macro/MacroTab'
import SectorMapTab from './components/sector/SectorMapTab'
import LearningNotesTab from './components/notes/LearningNotesTab'
import WatchlistTab from './components/watchlist/WatchlistTab'

export default function App() {
  const { activeTab, isLoading, analysisResult, setActiveTab, setAnalysisResult, setIsLoading, setSearchQuery } = useStore()
  const [inputValue, setInputValue] = useState('')

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    setSearchQuery(query)
    setIsLoading(true)
    setActiveTab('report')
    try {
      const result = await searchCompany(query)
      setAnalysisResult(result)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-blue-400 font-bold text-xl">📊 StockLens</span>
        </div>
        <SearchBar value={inputValue} onChange={setInputValue} onSearch={handleSearch} isLoading={isLoading} />
      </header>

      {/* Tab Nav */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'report' && (
          <ReportTab analysisResult={analysisResult} isLoading={isLoading} onSearch={handleSearch} />
        )}
        {activeTab === 'macro' && <MacroTab analysisResult={analysisResult} />}
        {activeTab === 'sector' && <SectorMapTab onCompanyClick={(name) => { handleSearch(name); }} />}
        {activeTab === 'notes' && <LearningNotesTab analysisResult={analysisResult} />}
        {activeTab === 'watchlist' && (
          <WatchlistTab onCompanyClick={(name) => { handleSearch(name); }} />
        )}
      </main>
    </div>
  )
}
