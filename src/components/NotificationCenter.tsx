import { useState, useEffect, type FC } from 'react'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'
import { api } from '../services/api'

interface NotificationItem {
  id: string
  title: string
  detail: string
  timestamp: string
  category: 'SKILL' | 'MARKET' | 'CAREER' | 'LEARNING'
  unread: boolean
  targetPage: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

export const NotificationCenter: FC<NotificationCenterProps> = ({ isOpen, onClose, onNavigate }) => {
  const { isHeist } = useTheme()
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'N-1',
      title: 'NEW SKILL SIGNAL DETECTED',
      detail: 'TypeScript demand accelerated by +31.2% across Tier 1 full-stack postings.',
      timestamp: '15m ago',
      category: 'SKILL',
      unread: true,
      targetPage: 'skill-intelligence',
    },
    {
      id: 'N-2',
      title: 'MACRO MARKET ALERT',
      detail: 'Cloud Engineer vacancies spiked +42% in Bangalore & Hyderabad tech corridors.',
      timestamp: '1h ago',
      category: 'MARKET',
      unread: true,
      targetPage: 'market-intelligence',
    },
    {
      id: 'N-3',
      title: 'CAREER OPPORTUNITY MATCH',
      detail: '3 new listings with 85%+ capability match found: Senior Full Stack Developer at TechCorp.',
      timestamp: '3h ago',
      category: 'CAREER',
      unread: false,
      targetPage: 'job-finder',
    },
    {
      id: 'N-4',
      title: 'RESISTANCE LEARNING OBJECTIVE',
      detail: 'Sprint 01: TypeScript Advanced Metaprogramming syllabus is ready for execution.',
      timestamp: 'Yesterday',
      category: 'LEARNING',
      unread: false,
      targetPage: 'roadmap',
    },
  ])

  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    api.notifications.list().then((list) => {
      if (mounted && list && list.length > 0) {
        const mapped: NotificationItem[] = list.map((n: any) => ({
          id: n.id,
          title: n.title,
          detail: n.message,
          timestamp: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          category: (n.type?.toUpperCase() as any) || 'SKILL',
          unread: !n.read_at,
          targetPage: n.metadata?.targetPage || 'feed',
        }))
        setNotifications((prev) => {
          // Merge avoiding duplicates
          const ids = new Set(mapped.map((m) => m.id))
          return [...mapped, ...prev.filter((p) => !ids.has(p.id))]
        })
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [isOpen])

  if (!isOpen) return null

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    api.notifications.markAllRead().catch(() => {})
  }

  const clearAll = () => {
    setNotifications([])
  }

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    )
    api.notifications.markRead(item.id).catch(() => {})
    onNavigate(item.targetPage)
    onClose()
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div
        className={cn(
          'w-full max-w-md h-full flex flex-col transition-colors',
          isHeist
            ? 'bg-charcoal border-l border-burgundy/40 shadow-glow-crimson'
            : 'bg-white border-l border-slate-200 shadow-2xl'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'p-5 border-b flex items-center justify-between',
            isHeist ? 'border-burgundy/30 bg-obsidian/70' : 'border-slate-200 bg-slate-50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <h3
              className={cn(
                'text-base font-bold',
                isHeist ? 'heading-xs text-warm-ivory' : 'font-sans text-slate-900'
              )}
            >
              {isHeist ? 'INTELLIGENCE ALERTS' : 'Platform Alerts & Notifications'}
            </h3>
            {unreadCount > 0 && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold',
                  isHeist
                    ? 'bg-crimson text-warm-ivory font-mono'
                    : 'bg-red-50 text-red-700 border border-red-200 font-sans'
                )}
              >
                {unreadCount} NEW
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              'px-2 py-1 text-xs font-mono rounded cursor-pointer transition-colors',
              isHeist ? 'text-warm-ivory/60 hover:text-crimson hover:bg-burgundy/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            )}
          >
            CLOSE
          </button>
        </div>

        {/* Toolbar */}
        <div
          className={cn(
            'px-5 py-2.5 border-b flex items-center justify-between text-xs',
            isHeist
              ? 'border-burgundy/20 bg-burgundy/10 text-warm-ivory/60 font-mono'
              : 'border-slate-200 bg-slate-50/60 text-slate-600 font-sans'
          )}
        >
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className={cn(
              'disabled:opacity-40 transition-colors',
              isHeist ? 'hover:text-warm-ivory' : 'hover:text-slate-900'
            )}
          >
            Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className={cn(
              'disabled:opacity-40 transition-colors',
              isHeist ? 'hover:text-crimson' : 'hover:text-red-600'
            )}
          >
            Clear wire
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  'p-3.5 rounded-lg border cursor-pointer transition-all space-y-1.5',
                  isHeist
                    ? item.unread
                      ? 'bg-burgundy/20 border-crimson/50 text-warm-ivory'
                      : 'bg-burgundy/10 border-burgundy/20 text-warm-ivory/70 hover:bg-burgundy/15'
                    : item.unread
                    ? 'bg-red-50/30 border-red-200 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-between text-[10px]',
                    isHeist ? 'font-mono' : 'font-sans'
                  )}
                >
                  <span className="flex items-center gap-1 font-bold">
                    <span className={isHeist ? 'text-crimson' : 'text-blue-600'}>
                      [{item.category}]
                    </span>
                    <span className={isHeist ? 'text-warm-ivory' : 'text-slate-800'}>
                      ALERT
                    </span>
                  </span>
                  <span className={isHeist ? 'text-warm-ivory/40' : 'text-slate-500'}>
                    {item.timestamp}
                  </span>
                </div>
                <h4
                  className={cn(
                    'text-xs font-bold leading-tight',
                    isHeist ? 'text-warm-ivory font-mono' : 'text-slate-900 font-sans'
                  )}
                >
                  {item.title}
                </h4>
                <p
                  className={cn(
                    'text-[11px] leading-relaxed',
                    isHeist ? 'text-warm-ivory/70 font-mono' : 'text-slate-600 font-sans'
                  )}
                >
                  {item.detail}
                </p>
                <div
                  className={cn(
                    'pt-1 flex items-center justify-end text-[10px] font-bold',
                    isHeist ? 'font-mono text-crimson' : 'font-sans text-red-700'
                  )}
                >
                  <span>{isHeist ? 'DISPATCH TO BRIEFING →' : 'View Module Briefing →'}</span>
                </div>
              </div>
            ))
          ) : (
            <div
              className={cn(
                'p-8 text-center text-xs',
                isHeist ? 'font-mono text-warm-ivory/40' : 'font-sans text-slate-500'
              )}
            >
              Zero pending intelligence transmissions.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'p-3 border-t text-center text-[10px]',
            isHeist
              ? 'bg-obsidian/90 border-burgundy/30 font-mono text-warm-ivory/40'
              : 'bg-slate-50 border-slate-200 font-sans text-slate-500'
          )}
        >
          {isHeist ? 'SECURE CHANNEL // 256-BIT ENCRYPTED TELEMETRY' : 'VERIFIED TELEMETRY // SOC2 SECURE PIPELINE'}
        </div>
      </div>
    </div>
  )
}
