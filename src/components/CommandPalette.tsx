import { useState, useEffect, useMemo, type FC } from 'react'
import { mockMarketData } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

interface PaletteItem {
  id: string
  title: string
  subtitle: string
  category: 'NAVIGATION' | 'SKILLS'
  pageTarget: string
}

export const CommandPalette: FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const { setMode, isHeist } = useTheme()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Global key listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const allItems: PaletteItem[] = useMemo(() => {
    const themeCommands: PaletteItem[] = [
      {
        id: 'cmd-theme-toggle',
        title: isHeist ? 'Switch to Professional Mode' : 'Switch to Heist Mode',
        subtitle: isHeist
          ? 'Transform interface into clean enterprise talent intelligence workspace'
          : 'Arm classified Money Heist tactical intelligence command center',
        category: 'NAVIGATION',
        pageTarget: isHeist ? '__theme:professional' : '__theme:heist',
      },
    ]

    const allPages: PaletteItem[] = [
      { id: 'p-landing', title: isHeist ? 'Classified Briefing // 3D Landing Experience' : 'Platform Overview & 3D Briefing', subtitle: 'Experience the 3D briefing room, tactical dossier, and operation intro', category: 'NAVIGATION', pageTarget: 'landing' },
      { id: 'p-1', title: isHeist ? 'War Room Command' : 'Executive Overview', subtitle: 'Macro Overview & Intelligence Pulse', category: 'NAVIGATION', pageTarget: 'war-room' },
      { id: 'p-2', title: isHeist ? 'Market Intelligence Radar' : 'Market Demand Dynamics', subtitle: 'Hiring Volume, Velocity & Geo Analysis', category: 'NAVIGATION', pageTarget: 'market-intelligence' },
      { id: 'p-3', title: isHeist ? 'Skill Intelligence Radar' : 'Skill Analytics & Adoption', subtitle: 'Canonical Skills & Co-occurrence Network', category: 'NAVIGATION', pageTarget: 'skill-intelligence' },
      { id: 'p-4', title: isHeist ? 'Role Intelligence Dossiers' : 'Role Competencies', subtitle: 'Standardized Role Families & Pathways', category: 'NAVIGATION', pageTarget: 'role-intelligence' },
      { id: 'p-12', title: 'Simulation Vault (ML Models)', subtitle: 'JDS Salary & SDS Leadership ML Inference', category: 'NAVIGATION', pageTarget: 'simulation' },
    ]

    const skills: PaletteItem[] = mockMarketData.topSkills.map((s) => ({
      id: `skill-${s.name}`,
      title: `Skill: ${s.name}`,
      subtitle: `${s.demand}% Market Share • Momentum: ${s.trend}`,
      category: 'SKILLS',
      pageTarget: 'skill-intelligence',
    }))

    return [...themeCommands, ...allPages, ...skills]
  }, [isHeist])

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8)
    const q = query.toLowerCase()
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [allItems, query])

  const handleSelect = (target: string) => {
    if (target === '__theme:professional') {
      setMode('professional')
      onClose()
      return
    }
    if (target === '__theme:heist') {
      setMode('heist')
      onClose()
      return
    }
    onNavigate(target)
    onClose()
  }

  // Keyboard navigation up / down / enter
  useEffect(() => {
    if (!isOpen) return
    const handleNavKeys = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex].pageTarget)
        }
      }
    }
    window.addEventListener('keydown', handleNavKeys)
    return () => window.removeEventListener('keydown', handleNavKeys)
  }, [isOpen, filtered, selectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-16 md:pt-24 p-4">
      <div
        className={cn(
          'card max-w-2xl w-full p-0 overflow-hidden flex flex-col max-h-[80vh] transition-colors',
          isHeist
            ? 'bg-charcoal border-crimson/50 shadow-glow-crimson'
            : 'bg-white border-slate-200 shadow-2xl rounded-xl'
        )}
      >
        {/* Search Input Bar */}
        <div
          className={cn(
            'p-4 border-b flex items-center gap-3',
            isHeist ? 'border-burgundy/30 bg-obsidian/70' : 'border-slate-200 bg-slate-50'
          )}
        >
          <span className={cn('text-xs font-mono font-bold', isHeist ? 'text-crimson' : 'text-slate-500')}>
            FIND
          </span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={
              isHeist
                ? 'Type an operation, dossier, job, or skill code...'
                : 'Search analytics, modules, candidates, jobs, or skills...'
            }
            className={cn(
              'flex-1 bg-transparent text-sm outline-none',
              isHeist
                ? 'font-mono text-warm-ivory placeholder-warm-ivory/40'
                : 'font-sans text-slate-900 placeholder-slate-400 font-medium'
            )}
          />
          <kbd
            className={cn(
              'px-2 py-0.5 text-[10px] font-mono rounded border',
              isHeist
                ? 'bg-burgundy/20 border-burgundy/30 text-warm-ivory/60'
                : 'bg-white border-slate-200 text-slate-500'
            )}
          >
            ESC
          </kbd>
          <button
            onClick={onClose}
            className={cn(
              'px-2 py-0.5 text-xs font-mono rounded transition-colors',
              isHeist ? 'text-warm-ivory/50 hover:text-crimson' : 'text-slate-400 hover:text-slate-700'
            )}
          >
            ✕
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = selectedIndex === idx
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.pageTarget)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg flex items-center justify-between text-xs transition-colors border',
                    isHeist
                      ? isSelected
                        ? 'bg-burgundy/30 border-crimson/60 text-warm-ivory font-bold shadow-glow-crimson font-mono'
                        : 'border-transparent text-warm-ivory/80 hover:bg-burgundy/15 font-mono'
                      : isSelected
                      ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold font-sans shadow-sm'
                      : 'border-transparent text-slate-700 hover:bg-slate-50 font-sans'
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        'text-sm leading-tight',
                        isHeist ? 'text-warm-ivory font-semibold' : 'text-slate-900 font-semibold'
                      )}
                    >
                      {item.title}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] mt-0.5',
                        isHeist ? 'text-warm-ivory/50 font-mono' : 'text-slate-500 font-sans'
                      )}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold font-mono',
                        isHeist
                          ? 'bg-burgundy/20 text-crimson'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      )}
                    >
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className={cn('text-[10px] font-mono', isHeist ? 'text-crimson' : 'text-slate-600')}>
                        ↵
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          ) : (
            <div
              className={cn(
                'p-8 text-center text-xs',
                isHeist ? 'font-mono text-warm-ivory/40' : 'font-sans text-slate-400'
              )}
            >
              {isHeist ? `No tactical records match "${query}".` : `No matching results found for "${query}".`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'p-2.5 border-t flex items-center justify-between text-[11px]',
            isHeist
              ? 'bg-obsidian/80 border-burgundy/30 font-mono text-warm-ivory/40'
              : 'bg-slate-50 border-slate-200 font-sans text-slate-500'
          )}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd
                className={cn(
                  'px-1 py-0.5 rounded border text-[9px] font-mono',
                  isHeist ? 'bg-burgundy/20 border-burgundy/30' : 'bg-white border-slate-200'
                )}
              >
                ARROWS
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd
                className={cn(
                  'px-1 py-0.5 rounded border text-[9px] font-mono',
                  isHeist ? 'bg-burgundy/20 border-burgundy/30' : 'bg-white border-slate-200'
                )}
              >
                ENTER
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd
                className={cn(
                  'px-1 py-0.5 rounded border text-[9px] font-mono',
                  isHeist ? 'bg-burgundy/20 border-burgundy/30' : 'bg-white border-slate-200'
                )}
              >
                ESC
              </kbd>{' '}
              Close
            </span>
          </div>
          <span className={isHeist ? 'text-crimson font-bold font-mono' : 'text-slate-700 font-semibold font-sans'}>
            {isHeist ? 'COMMAND PALETTE // ACTIVE' : 'COMMAND SEARCH'}
          </span>
        </div>
      </div>
    </div>
  )
}
