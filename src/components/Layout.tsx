import { useState, useEffect } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { AIChat } from "./AIChat"
import { GlossaryModal } from "./GlossaryModal"

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Desktop Sidebar State
  // 1. Pinned State (Persisted)
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
     if (typeof window !== 'undefined') {
         const saved = localStorage.getItem("sidebar_pinned")
         // Default to true if not set
         return saved !== null ? JSON.cast ? JSON.parse(saved) : saved === 'true' : true
     }
     return true
  })
  
  // 2. Hover State (Ephemeral)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  // Persist Pinned State
  useEffect(() => {
      localStorage.setItem("sidebar_pinned", String(isSidebarPinned))
  }, [isSidebarPinned])

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <GlossaryModal />
      
      {/* Notion-style Hotspot / Gutter */}
      {/* Invisible 20px trigger zone on far left - ONLY active when sidebar is unpinned */}
      {!isSidebarPinned && (
        <div 
          className="fixed inset-y-0 left-0 w-5 z-40 bg-transparent" // w-5 = 20px
          onMouseEnter={() => setIsSidebarHovered(true)}
        />
      )}

      <div className="flex h-screen overflow-hidden relative">
        <Sidebar 
            // Mobile props
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)}
            
            // Desktop props
            isPinned={isSidebarPinned}
            isHovered={isSidebarHovered}
            onTogglePin={() => {
                const newState = !isSidebarPinned
                setIsSidebarPinned(newState)
                // If we unpin, we are still hovering it, so keep it visible as overlay until mouse leave
                if (!newState) setIsSidebarHovered(true) 
            }}
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <Header 
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            // Desktop toggle just toggles the pinned state
            onDesktopToggle={() => setIsSidebarPinned(!isSidebarPinned)}
            // Icon hover also triggers the overlay
            onMenuHover={() => setIsSidebarHovered(true)}
            isSidebarOpen={isSidebarPinned}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          <AIChat />
        </div>
      </div>
    </div>
  )
}
