import type { SectorInfo } from '../../types'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface Props {
  sector: SectorInfo
  companyName: string
}

export default function SectorBreadcrumb({ sector, companyName }: Props) {
  const [active, setActive] = useState<string>(companyName)

  const crumbs = [sector.major, sector.middle, sector.minor, companyName]

  return (
    <div className="flex items-center gap-1 text-sm flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-gray-500" />}
          <button
            onClick={() => setActive(crumb)}
            className={`px-2 py-0.5 rounded transition-colors ${
              active === crumb
                ? i === crumbs.length - 1
                  ? 'text-blue-400 font-semibold'
                  : 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {crumb}
          </button>
        </span>
      ))}
    </div>
  )
}
