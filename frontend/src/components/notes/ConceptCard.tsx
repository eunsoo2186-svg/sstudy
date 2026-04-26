import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface Concept {
  id: string
  tag: '밸류에이션' | '매크로' | '섹터' | '성장성' | '리스크'
  question: string
  explanation: string
}

type Level = '모름' | '어렴풋이' | '이해함'

interface Props {
  concept: Concept
  level: Level
  onLevelChange: (level: Level) => void
}

const TAG_COLORS: Record<string, string> = {
  밸류에이션: 'bg-blue-900 text-blue-300',
  매크로: 'bg-purple-900 text-purple-300',
  섹터: 'bg-green-900 text-green-300',
  성장성: 'bg-yellow-900 text-yellow-300',
  리스크: 'bg-red-900 text-red-300',
}

const LEVELS: Level[] = ['모름', '어렴풋이', '이해함']
const LEVEL_COLORS: Record<Level, string> = {
  모름: 'bg-gray-700 text-gray-300',
  어렴풋이: 'bg-yellow-900 text-yellow-300',
  이해함: 'bg-green-900 text-green-300',
}
const LEVEL_ACTIVE: Record<Level, string> = {
  모름: 'bg-gray-600 text-white border-gray-400',
  어렴풋이: 'bg-yellow-700 text-white border-yellow-400',
  이해함: 'bg-green-700 text-white border-green-400',
}

export default function ConceptCard({ concept, level, onLevelChange }: Props) {
  const [expanded, setExpanded] = useState(false)

  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(concept.question + '에 대해 투자 관점에서 자세히 설명해주세요')}`

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${TAG_COLORS[concept.tag] ?? 'bg-gray-700 text-gray-300'}`}>
          {concept.tag}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${LEVEL_COLORS[level]}`}>{level}</span>
      </div>
      <h4 className="text-sm font-semibold text-white mb-3">{concept.question}</h4>

      {/* Level selector */}
      <div className="flex gap-1 mb-3">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => onLevelChange(l)}
            className={`flex-1 text-xs py-1 rounded border transition-colors ${
              level === l ? LEVEL_ACTIVE[l] : 'bg-gray-700 text-gray-400 border-gray-600 hover:bg-gray-600'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Expandable explanation */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 w-full"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? '접기' : '설명 보기'}
      </button>
      {expanded && (
        <p className="mt-2 text-xs text-gray-300 leading-relaxed border-t border-gray-700 pt-2">
          {concept.explanation}
        </p>
      )}

      {/* Claude link */}
      <a
        href={claudeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
      >
        <ExternalLink size={10} />
        Claude에게 더 물어보기
      </a>
    </div>
  )
}
