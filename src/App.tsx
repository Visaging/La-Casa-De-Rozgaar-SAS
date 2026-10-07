import { useState, useEffect } from 'react'
import { Sidebar, Header } from './components/Layout'
import { CommandPalette } from './components/CommandPalette'
import { NotificationCenter } from './components/NotificationCenter'
import { ThemeProvider, useTheme, applyDomTheme } from './hooks/useTheme'
import { ThemeTransitionOverlay } from './components/ThemeTransitionOverlay'
import { cn } from './lib/utils'

// Core Intelligence Pages (Competition Dataset Analysis)
import { WarRoom } from './pages/WarRoom'
import { MarketIntelligence } from './pages/MarketIntelligence'
import { SkillIntelligence } from './pages/SkillIntelligence'
import { RoleIntelligence } from './pages/RoleIntelligence'
import { SimulationVault } from './pages/SimulationVault'
import { LandingExperience } from './components/landing/LandingExperience'

// Core Dataset-Driven Page Types (SAS Competition Scope)
export type PageType =
  | 'landing'
  | 'war-room'
  | 'market-intelligence'
  | 'skill-intelligence'
  | 'role-intelligence'
  | 'simulation'

function AppContent() {
  const { isHeist, mode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const getInitialPage = (): PageType => {
    const rawHash = window.location.hash.replace('#/', '').replace('#', '')
    const pageKey = rawHash.split('?')[0]
    if (pageKey === '' || pageKey === 'landing' || pageKey === 'home') {
      return 'landing'
    }
    if (pageKey && isValidPage(pageKey)) {
      return pageKey as PageType
    }
    return 'landing'
  }

  const isValidPage = (page: string): boolean => {
    const validPages: PageType[] = [
      'landing',
      'war-room',
      'market-intelligence',
      'skill-intelligence',
      'role-intelligence',
      'simulation',
    ]
    return validPages.includes(page as PageType)
  }

  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage)

  const handleNavigation = (page: string) => {
    if (page === '' || page === 'landing' || page === 'home') {
      setCurrentPage('landing')
      window.location.hash = '#/'
      setSidebarOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (isValidPage(page)) {
      const targetPage = page as PageType
      applyDomTheme(mode)
      setCurrentPage(targetPage)
      window.location.hash = `#/${targetPage}`
    }
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Listen to hash changes (back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#/', '').replace('#', '')
      const pageKey = rawHash.split('?')[0]
      if (pageKey === '' || pageKey === 'landing' || pageKey === 'home') {
        setCurrentPage('landing')
      } else if (pageKey && isValidPage(pageKey)) {
        setCurrentPage(pageKey as PageType)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Global keybinding for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'market-intelligence':
        return <MarketIntelligence onNavigate={handleNavigation} />
      case 'skill-intelligence':
        return <SkillIntelligence onNavigate={handleNavigation} />
      case 'role-intelligence':
        return <RoleIntelligence onNavigate={handleNavigation} />
      case 'simulation':
        return <SimulationVault />
      case 'landing':
        return <LandingExperience loginUrl="#/war-room" onJoin={() => handleNavigation('war-room')} />
      case 'war-room':
      default:
        return <WarRoom onNavigate={handleNavigation} />
    }
  }

  // Full-screen presentation for 3D Cinematic Landing Experience (Root / Home Route)
  if (currentPage === 'landing') {
    return (
      <div className="w-full relative bg-[#0d0b0b] text-white">
        <ThemeTransitionOverlay />
        <LandingExperience
          loginUrl="#/war-room"
          onJoin={() => handleNavigation('war-room')}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden relative transition-colors duration-300',
        isHeist
          ? 'bg-obsidian text-warm-ivory classified-grid'
          : 'bg-[#F8F9FA] text-[#0F172A]'
      )}
    >
      {/* Global Cinematic Theme Transition Overlay */}
      <ThemeTransitionOverlay />

      {/* Sidebar with navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigation}
        currentPage={currentPage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search, Mode Switcher & Notifications */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onNavigate={handleNavigation}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          currentPage={currentPage}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <div
              key={`${currentPage}-${isHeist ? 'heist' : 'pro'}`}
              className={isHeist ? 'page-enter-heist' : 'page-enter-professional'}
            >
              {renderPage()}
            </div>
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigation}
      />

      {/* Global Intelligence Notifications Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={handleNavigation}
      />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
