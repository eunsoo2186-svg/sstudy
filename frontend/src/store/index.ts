import { create } from 'zustand'
import type { AnalysisResult } from '../types'

interface WatchlistItem {
  ticker: string
  name: string
  price: number
  priceChangePercent: number
}

interface AppStore {
  searchQuery: string
  activeTab: 'report' | 'macro' | 'sector' | 'notes' | 'watchlist'
  analysisResult: AnalysisResult | null
  isLoading: boolean
  watchlist: WatchlistItem[]
  setSearchQuery: (q: string) => void
  setActiveTab: (tab: AppStore['activeTab']) => void
  setAnalysisResult: (result: AnalysisResult | null) => void
  setIsLoading: (loading: boolean) => void
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (ticker: string) => void
}

const loadWatchlist = (): WatchlistItem[] => {
  try {
    const saved = localStorage.getItem('stocklens-watchlist')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

const saveWatchlist = (list: WatchlistItem[]) => {
  localStorage.setItem('stocklens-watchlist', JSON.stringify(list))
}

export const useStore = create<AppStore>((set) => ({
  searchQuery: '',
  activeTab: 'report',
  analysisResult: null,
  isLoading: false,
  watchlist: loadWatchlist(),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  addToWatchlist: (item) =>
    set((state) => {
      if (state.watchlist.find((w) => w.ticker === item.ticker)) return state
      const updated = [...state.watchlist, item]
      saveWatchlist(updated)
      return { watchlist: updated }
    }),
  removeFromWatchlist: (ticker) =>
    set((state) => {
      const updated = state.watchlist.filter((w) => w.ticker !== ticker)
      saveWatchlist(updated)
      return { watchlist: updated }
    }),
}))
