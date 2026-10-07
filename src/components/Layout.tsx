import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'
import { useWindowSize } from '../hooks/useWindowSize'
import { ThemeModeSwitch } from './ThemeModeSwitch'
import { cn } from '../lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
  currentPage: string
}

interface NavSubItem {
  label: string
  href: string
}

interface NavGroup {
  label: string
  href?: string
  description?: string
  submenu?: NavSubItem[]
}

// ============================================================================
// HEIST MODE NAVIGATION TAXONOMY (Dataset & Analytics Aligned)
// ============================================================================
const heistNavigationItems: NavGroup[] = [
  {
    label: 'WAR ROOM',
    href: 'war-room',
    description: 'Command Center',
  },
  {
    label: 'LABOR INTELLIGENCE',
    submenu: [
      { label: 'Market Demand Analytics', href: 'market-intelligence' },
      { label: 'Skill Intelligence Network', href: 'skill-intelligence' },
      { label: 'Role Competency Profiles', href: 'role-intelligence' },
    ],
  },
  {
    label: 'SIMULATION ENGINE',
    submenu: [
      { label: 'ML Prediction Vault', href: 'simulation' },
    ],
  },
]

// ============================================================================
// ENTERPRISE MODE NAVIGATION TAXONOMY (Strict Anti-Vibecode Enterprise SaaS)
// ============================================================================
interface EnterpriseNavSection {
  title: string
  items: {
    label: string
    href: string
  }[]
}

const enterpriseNavSections: EnterpriseNavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Executive Command', href: 'war-room' },
    ],
  },
  {
    title: 'LABOR MARKET INTELLIGENCE',
    items: [
      { label: 'Market Overview', href: 'market-intelligence' },
      { label: 'Skill Analytics & Network', href: 'skill-intelligence' },
      { label: 'Role Competencies & Pathways', href: 'role-intelligence' },
    ],
  },
  {
    title: 'PREDICTIVE SIMULATION',
    items: [
      { label: 'ML Simulation Vault', href: 'simulation' },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentPage }) => {
  const { isHeist } = useTheme()
  const { width } = useWindowSize()
  const isDesktop = width >= 768
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleNavClick = (href: string) => {
    if (href && onNavigate) {
      onNavigate(href)
    }
    if (!isDesktop) {
      onClose()
    }
  }

  // ==========================================================================
  // ENTERPRISE SIDEBAR
  // ==========================================================================
  if (!isHeist) {
    return (
      <>
        {/* Mobile overlay */}
        {!isDesktop && isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm md:hidden z-40"
          />
        )}

        <aside
          className={cn(
            'fixed md:static top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 md:z-auto shrink-0 flex flex-col select-none transition-transform duration-200 ease-out',
            isDesktop ? 'translate-x-0' : isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Enterprise Brand Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleNavClick('war-room')}
                className="text-left group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-950 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src="/images/la-casa-de-rozgaar-logo.png"
                    alt="La Casa De Rozgaar"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight tracking-tight">
                    La Casa De Rozgaar
                  </h1>
                  <p className="text-[10px] font-medium text-slate-500 tracking-normal">
                    The House of Employment
                  </p>
                </div>
              </button>
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-slate-700 p-1 text-xs font-mono rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Enterprise Navigation List (Text + Hierarchy, No Icon Spam) */}
          <nav className="flex-1 px-3 py-3 pb-6 overflow-y-auto space-y-4">
            {enterpriseNavSections.map((section) => (
              <div key={section.title} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = item.href === currentPage
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors block',
                          isActive
                            ? 'bg-blue-50 text-blue-800 font-semibold border-l-2 border-blue-700'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      </>
    )
  }

  // ==========================================================================
  // HEIST MODE SIDEBAR
  // ==========================================================================
  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm md:hidden z-40"
        />
      )}

      {/* Sidebar Panel */}
      <motion.aside
        initial={{ x: isDesktop ? 0 : -300 }}
        animate={{ x: isDesktop ? 0 : isOpen ? 0 : -300 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'fixed md:static top-0 left-0 h-screen w-64 bg-gradient-obsidian border-r border-burgundy/25 z-50 md:z-auto shrink-0',
          'flex flex-col select-none'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-burgundy/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick('war-room')}
              className="text-left group transition-transform duration-200 hover:scale-[1.01]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-black/90 border border-burgundy/40 shadow-glow-crimson flex items-center justify-center shrink-0">
                  <img
                    src="/images/la-casa-de-rozgaar-logo.png"
                    alt="La Casa De Rozgaar"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="heading-sm text-crimson leading-tight group-hover:text-crimson-light">LA CASA</h1>
                  <h2 className="heading-xs text-warm-ivory leading-tight">DE ROZGAAR</h2>
                </div>
              </div>
              <p className="text-[9px] text-warm-ivory/50 mt-1 font-mono tracking-widest uppercase">
                THE HOUSE OF EMPLOYMENT
              </p>
            </button>
            <button
              onClick={onClose}
              className="md:hidden text-warm-ivory/60 hover:text-crimson p-1 text-xs font-mono rounded-lg hover:bg-burgundy/20 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 pb-6 space-y-1 overflow-y-auto">
          {heistNavigationItems.map((item) => {
            const isDirectActive = item.href === currentPage
            const isSubActive = item.submenu?.some((s) => s.href === currentPage)
            const isExpanded = expandedMenu === item.label || isSubActive

            return (
              <div key={item.label} className="space-y-0.5">
                {item.submenu ? (
                  <button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-between',
                      isSubActive
                        ? 'text-crimson bg-burgundy/20 border border-crimson/30 font-bold'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10 font-semibold'
                    )}
                  >
                    <span className="tracking-wider uppercase">{item.label}</span>
                    <span
                      className={cn(
                        'text-[10px] transition-transform duration-200 text-warm-ivory/40',
                        isExpanded ? 'rotate-180 text-crimson' : ''
                      )}
                    >
                      ▾
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.href!)}
                    className={cn(
                      'w-full text-left px-3.5 py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-between',
                      isDirectActive
                        ? 'text-warm-ivory bg-gradient-crimson shadow-glow-crimson font-bold border border-crimson/50'
                        : 'text-warm-ivory/80 hover:text-crimson hover:bg-burgundy/10 font-semibold'
                    )}
                  >
                    <div>
                      <span className="tracking-wider uppercase">{item.label}</span>
                      {item.description && (
                        <p
                          className={cn(
                            'text-[9px] tracking-normal font-sans',
                            isDirectActive ? 'text-warm-ivory/80' : 'text-warm-ivory/50'
                          )}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    {isDirectActive && <span className="w-1.5 h-1.5 rounded-full bg-warm-ivory animate-pulse" />}
                  </button>
                )}

                {/* Submenu Children */}
                {item.submenu && isExpanded && (
                  <div className="ml-2 pl-3 border-l border-burgundy/30 space-y-0.5 py-1">
                    {item.submenu.map((subitem) => {
                      const isChildActive = subitem.href === currentPage
                      return (
                        <button
                          key={subitem.label}
                          onClick={() => handleNavClick(subitem.href)}
                          className={cn(
                            'w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-all flex items-center justify-between font-mono',
                            isChildActive
                              ? 'text-crimson font-bold bg-burgundy/30 border-l-2 border-crimson'
                              : 'text-warm-ivory/70 hover:text-warm-ivory hover:bg-burgundy/10'
                          )}
                        >
                          <span className="truncate">{subitem.label}</span>
                          {isChildActive && <span className="text-[10px] text-crimson font-bold">●</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </motion.aside>
    </>
  )
}

interface HeaderProps {
  onMenuClick: () => void
  sidebarOpen: boolean
  onNavigate: (page: string) => void
  onOpenCommandPalette: () => void
  onOpenNotifications: () => void
  currentPage: string
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarOpen,
  onNavigate,
  onOpenCommandPalette,
  onOpenNotifications,
  currentPage,
}) => {
  const { isHeist } = useTheme()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState('Global Operations')

  const heistPageTitles: Record<string, string> = {
    'war-room': 'WAR ROOM COMMAND CENTER',
    'market-intelligence': 'MARKET INTELLIGENCE RADAR',
    'skill-intelligence': 'SKILL VELOCITY & DEMAND',
    'role-intelligence': 'ROLE COMPETENCY PROFILES',
    'compensation': 'COMPENSATION INTELLIGENCE',
    'forecast': 'FUTURE WORKFORCE FORECAST',
    'assessment': 'SECURE PROCTORED ASSESSMENT',
    'skill-heist': 'SKILL HEIST ROADMAP',
    'job-finder': 'AI JOB MATCHING ENGINE',
    'career-intelligence': 'CAREER INTELLIGENCE PATHWAYS',
    'simulation': 'SIMULATION VAULT SCENARIO ENGINE',
    'talent-vault': 'TALENT VAULT RECRUIT DISCOVERY',
    'workforce-simulator': 'WORKFORCE SIMULATION SANDBOX',
    'workforce-gaps': 'WORKFORCE GAP ANALYSIS',
    'roadmap': 'RESISTANCE LEARNING SPRINT',
    'interviews': 'INTERVIEW INTELLIGENCE SYSTEM',
    'research': 'RESEARCH INTELLIGENCE REPOSITORY',
    'feed': 'INTELLIGENCE WIRE & WHAT\'S NEW',
  }

  const enterprisePageTitles: Record<string, string> = {
    'war-room': 'Executive Overview',
    'market-intelligence': 'Market Demand & Labor Dynamics',
    'skill-intelligence': 'Skill Intelligence & Analytics',
    'role-intelligence': 'Role Architecture & Competency',
    'compensation': 'Compensation & Market Benchmarks',
    'forecast': 'Workforce Demand Forecasts',
    'assessment': 'Standardized Skills Assessment',
    'skill-heist': 'Skill Development & Upskilling Roadmap',
    'job-finder': 'Candidate Matching Engine',
    'career-intelligence': 'Career Pathways & Mobility',
    'simulation': 'Workforce Scenario Simulator',
    'talent-vault': 'Talent Directory',
    'workforce-simulator': 'Workforce Scenario Simulator & ROI Modeling',
    'workforce-gaps': 'Workforce Gap Analysis',
    'roadmap': 'Learning Paths & Curriculum',
    'interviews': 'Technical Interview Intelligence',
    'research': 'Empirical Labor & AI Research',
    'feed': 'Market Intelligence Wire',
  }

  // ==========================================================================
  // ENTERPRISE HEADER
  // ==========================================================================
  if (!isHeist) {
    const title = enterprisePageTitles[currentPage] || 'Workforce Intelligence'

    return (
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5 gap-4">
          {/* Left: Mobile trigger & Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="md:hidden text-xs font-mono font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? '✕' : 'MENU'}
            </button>

            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                Acme Technologies <span className="text-slate-300 mx-1">/</span> Workforce Analytics
              </div>
              <h1 className="text-sm md:text-base font-semibold text-slate-900 leading-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 hover:border-slate-300 text-slate-500 text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="truncate">Search candidates, skills, roles, reports...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white text-slate-600 rounded border border-slate-200 font-mono shadow-2xs">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right: Workspace Switcher, Notifications, Mode Switch, Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Workspace Switcher */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              >
                <span>{selectedWorkspace}</span>
                <span className="text-slate-400 text-[10px]">▾</span>
              </button>

              {workspaceMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Workspaces
                  </div>
                  {['Global Operations', 'Engineering & Tech', 'Product Operations'].map((ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setSelectedWorkspace(ws)
                        setWorkspaceMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span>{ws}</span>
                      {selectedWorkspace === ws && <span className="text-blue-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compact Mode Switcher */}
            <ThemeModeSwitch variant="compact" />

            {/* Notifications Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
              title="Notifications"
            >
              <span>ALERTS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </button>
          </div>
        </div>
      </header>
    )
  }

  // ==========================================================================
  // HEIST HEADER
  // ==========================================================================
  const currentTitle = heistPageTitles[currentPage] || 'INTELLIGENCE TALENT COMMAND'

  return (
    <header className="sticky top-0 z-30 border-b border-burgundy/20 bg-charcoal/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
        {/* Mobile menu & current operation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden text-xs font-mono font-bold text-warm-ivory/80 hover:text-crimson px-2 py-1 rounded-lg hover:bg-burgundy/20"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? '✕' : 'MENU'}
          </button>

          <button onClick={() => onNavigate('war-room')} className="hidden sm:block text-left group">
            <span className="text-[10px] font-mono text-crimson font-bold uppercase tracking-wider block group-hover:underline header-op-tag">
              OPERATION // ACTIVE
            </span>
            <h2 className="text-xs md:text-sm font-heading font-bold text-warm-ivory tracking-wide header-title-text">
              {currentTitle}
            </h2>
          </button>
        </div>

        {/* Global Search Button / Trigger */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#17171B] rounded-lg border border-[#2C2C34] hover:border-crimson/70 text-white text-xs font-mono transition-all shadow-sm group header-search-box"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[#E0E0EA] group-hover:text-white transition-colors truncate header-search-text">
                Search intelligence, candidates, jobs...
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#25252D] text-[#D0D0DC] rounded border border-[#3C3C48] font-bold shrink-0 header-search-kbd">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Visual Mode Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dual Visual Mode Switcher */}
          <ThemeModeSwitch variant="compact" />

          {/* Mobile search trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-[#17171B] border border-[#2C2C34] rounded-lg text-white hover:text-crimson transition-colors header-search-box"
            aria-label="Open search palette"
          >
            <span className="text-[10px] font-mono text-[#D0D0DC] font-semibold header-search-text">SEARCH</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative px-2.5 py-1 text-xs font-mono text-warm-ivory/80 hover:text-crimson rounded-lg hover:bg-burgundy/20 transition-colors header-bell-btn cursor-pointer flex items-center gap-1.5"
            title="Intelligence Alerts"
          >
            <span className="text-[11px] font-bold">ALERTS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  )
}

