import { useState, useEffect } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { AIChat } from "./AIChat"
import { GlossaryModal } from "./GlossaryModal"
import { cn } from "@/lib/utils"

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 1. PINNED STATE: Does the sidebar push content? (Persisted)
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
     if (typeof window !== 'undefined') {
         const saved = localStorage.getItem("sidebar_pinned")
         return saved !== null ? saved === 'true' : true
     }
     return true
  })
  
  // 2. HOVER STATE: Is the mouse trying to peek at the menu?
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  // Graceful Hover Logic
  const handleHoverOpen = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setIsSidebarHovered(true)
  }

  const handleHoverClose = () => {
    const timeout = setTimeout(() => {
        setIsSidebarHovered(false)
    }, 300) // 300ms grace period to move from icon to sidebar
    setHoverTimeout(timeout)
  }

  useEffect(() => {
      localStorage.setItem("sidebar_pinned", String(isSidebarPinned))
  }, [isSidebarPinned])

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <GlossaryModal />

      {/* FIXED TOP HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header 
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            onDesktopToggle={() => setIsSidebarPinned(!isSidebarPinned)} 
            onMenuHover={handleHoverOpen} 
            onMenuLeave={handleHoverClose}
            isSidebarOpen={isSidebarPinned} 
        />
      </div>

      {/* MAIN CONTENT ROW (Padded top for header) */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden">
          
          {/* THE SPACER (Push Logic) */}
          <div 
              className={cn(
                  "flex-shrink-0 transition-[width] duration-300 ease-in-out hidden md:block",
                  isSidebarPinned ? "w-64" : "w-0"
              )} 
          />

          {/* THE SIDEBAR (Fixed, Under Header) */}
          <Sidebar 
              isOpen={isMobileMenuOpen} 
              isPinned={isSidebarPinned}
              isHovered={isSidebarHovered}
              onClose={() => setIsMobileMenuOpen(false)}
              onTogglePin={() => setIsSidebarPinned(!isSidebarPinned)}
              onMouseEnter={handleHoverOpen}
              onMouseLeave={handleHoverClose}
          />

          {/* SCROLLABLE CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-background">
              {children}
          </main>
          
          <AIChat />
      </div>
    </div>
  )
}
