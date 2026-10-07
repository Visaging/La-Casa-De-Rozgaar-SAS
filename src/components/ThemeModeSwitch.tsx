import React from 'react'
import { useTheme, type VisualMode } from '../hooks/useTheme'
import { cn } from '../lib/utils'

interface ThemeModeSwitchProps {
  variant?: 'compact' | 'sidebar'
  className?: string
}

export const ThemeModeSwitch: React.FC<ThemeModeSwitchProps> = ({
  variant = 'compact',
  className,
}) => {
  const { mode, setMode, isHeist, isProfessional } = useTheme()

  const handleSelect = (target: VisualMode) => {
    if (target !== mode) {
      setMode(target)
    }
  }

  // ==========================================
  // COMPACT VARIANT (For Top Header)
  // ==========================================
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'relative flex items-center p-0.5 rounded-lg border transition-all duration-150 select-none',
          isHeist
            ? 'bg-[#121216] border-burgundy/40 shadow-inner'
            : 'bg-slate-100 border-slate-200 shadow-inner',
          className
        )}
        role="group"
        aria-label="Operating Mode Selector"
      >
        {/* Heist Option */}
        <button
          type="button"
          onClick={() => handleSelect('heist')}
          className={cn(
            'relative z-10 flex items-center px-2.5 py-1 text-xs rounded-md transition-all duration-150 cursor-pointer',
            isHeist
              ? 'bg-gradient-crimson text-white font-mono font-bold shadow-glow-crimson'
              : 'text-slate-500 hover:text-slate-800 dark:text-warm-ivory/60 dark:hover:text-warm-ivory font-mono'
          )}
          title="Switch to Heist Mode (Money Heist Classified Operations)"
        >
          <span className="tracking-wider uppercase text-[11px]">HEIST</span>
        </button>

        {/* Professional Option */}
        <button
          type="button"
          onClick={() => handleSelect('professional')}
          className={cn(
            'relative z-10 flex items-center px-2.5 py-1 text-xs rounded-md transition-all duration-150 cursor-pointer',
            isProfessional
              ? 'bg-white text-slate-900 font-sans font-semibold shadow-sm border border-slate-200/80'
              : 'text-warm-ivory/60 hover:text-warm-ivory font-sans'
          )}
          title="Switch to Professional Mode (Enterprise Talent Intelligence)"
        >
          <span className="text-[11px]">PROFESSIONAL</span>
        </button>
      </div>
    )
  }

  // ==========================================
  // SIDEBAR VARIANT (For Navigation Console)
  // ==========================================
  return (
    <div className={cn('space-y-2 select-none', className)}>
      <div className="flex items-center justify-between text-[10px] font-mono px-0.5">
        <span
          className={cn(
            'uppercase tracking-widest font-semibold',
            isHeist ? 'text-warm-ivory/50' : 'text-slate-500'
          )}
        >
          VISUAL OPERATING MODE
        </span>
        <span
          className={cn(
            'text-[9px] font-bold px-1.5 py-0.5 rounded',
            isHeist
              ? 'bg-crimson/20 text-crimson border border-crimson/30'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          )}
        >
          {isHeist ? 'CLASSIFIED' : 'ENTERPRISE'}
        </span>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 p-1 rounded-lg border gap-1 transition-all duration-150',
          isHeist
            ? 'bg-[#121216] border-burgundy/30'
            : 'bg-slate-100 border-slate-200'
        )}
      >
        {/* Heist Tab */}
        <button
          type="button"
          onClick={() => handleSelect('heist')}
          className={cn(
            'relative py-2 px-2.5 rounded-md text-left transition-all duration-150 flex flex-col justify-center cursor-pointer',
            isHeist
              ? 'bg-gradient-crimson text-white shadow-glow-crimson border border-crimson/50'
              : 'text-warm-ivory/60 hover:text-warm-ivory hover:bg-white/5'
          )}
        >
          <div className="font-mono text-xs font-bold tracking-wider uppercase">
            <span>HEIST</span>
          </div>
          <span
            className={cn(
              'text-[9px] font-mono mt-0.5 leading-tight',
              isHeist ? 'text-warm-ivory/80' : 'text-warm-ivory/40'
            )}
          >
            Tactical HQ
          </span>
        </button>

        {/* Professional Tab */}
        <button
          type="button"
          onClick={() => handleSelect('professional')}
          className={cn(
            'relative py-2 px-2.5 rounded-md text-left transition-all duration-150 flex flex-col justify-center cursor-pointer',
            isProfessional
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-warm-ivory/60 hover:text-warm-ivory hover:bg-white/5'
          )}
        >
          <div className="font-sans text-xs font-semibold">
            <span>PRO</span>
          </div>
          <span
            className={cn(
              'text-[9px] font-sans mt-0.5 leading-tight',
              isProfessional ? 'text-slate-500 font-medium' : 'text-warm-ivory/40'
            )}
          >
            Enterprise
          </span>
        </button>
      </div>
    </div>
  )
}
