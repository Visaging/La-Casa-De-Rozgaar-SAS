import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

export const ThemeTransitionOverlay: React.FC = () => {
  const { isTransitioning, transitionDirection } = useTheme()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
    }
  }, [])

  if (!isTransitioning || !transitionDirection || prefersReducedMotion) {
    return null
  }

  const isToProfessional = transitionDirection === 'to-professional'

  return (
    <div
      className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {isToProfessional ? (
          // ==========================================
          // HEIST -> PROFESSIONAL SWEEP (Snappy 260ms)
          // ==========================================
          <motion.div
            key="sweep-to-professional"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Luminous blue/white scan line sweeping left to right */}
            <motion.div
              initial={{ left: '-5%' }}
              animate={{ left: '105%' }}
              transition={{ duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
              className="absolute top-0 bottom-0 w-1 md:w-1.5 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, #3B82F6 30%, #60A5FA 50%, #1D4ED8 70%, transparent 100%)',
                boxShadow: '0 0 16px rgba(59, 130, 246, 0.8), 0 0 28px rgba(37, 99, 235, 0.5)',
              }}
            />

            {/* Snappy toast badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-5 right-5 pointer-events-none px-3 py-1.5 rounded-lg bg-white/95 text-slate-900 border border-slate-200 shadow-lg font-sans text-xs font-semibold flex items-center gap-2"
            >
              <span className="text-[11px] font-medium text-slate-700">ENTERPRISE MODE ACTIVE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </motion.div>
          </motion.div>
        ) : (
          // ==========================================
          // PROFESSIONAL -> HEIST SWEEP (Snappy 260ms)
          // ==========================================
          <motion.div
            key="sweep-to-heist"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Tactical crimson scan line sweeping left to right */}
            <motion.div
              initial={{ left: '-5%' }}
              animate={{ left: '105%' }}
              transition={{ duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
              className="absolute top-0 bottom-0 w-1 md:w-1.5 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, #B3132B 30%, #FF4D6D 50%, #B3132B 70%, transparent 100%)',
                boxShadow: '0 0 18px rgba(179, 19, 43, 0.9), 0 0 32px rgba(255, 77, 109, 0.6)',
              }}
            />

            {/* Snappy tactical badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-5 right-5 pointer-events-none px-3 py-1.5 rounded-lg bg-[#151518]/95 text-warm-ivory border border-crimson/50 shadow-glow-crimson font-mono text-xs font-bold flex items-center gap-2"
            >
              <span className="text-[11px] font-mono tracking-wider text-warm-ivory">HEIST MODE // ARMED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-ping" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
