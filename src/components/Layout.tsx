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

  useEffect(() => {
      localStorage.setItem("sidebar_pinned", String(isSidebarPinned))
  }, [isSidebarPinned])

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex">
      <GlossaryModal />

      {/* The Spacer (Push Logic) */}
      <div 
          className={cn(
              "flex-shrink-0 transition-[width] duration-300 ease-in-out hidden md:block",
              isSidebarPinned ? "w-64" : "w-0"
          )} 
      />

      {/* The Hitbox (Hover Logic) */}
      {!isSidebarPinned && (
        <div 
            className="fixed inset-y-0 left-0 w-6 z-40 bg-transparent"
            onMouseEnter={() => setIsSidebarHovered(true)}
        />
      )}

      {/* The Sidebar Component */}
      <Sidebar 
          isOpen={isMobileMenuOpen} // Mobile state
          isPinned={isSidebarPinned} // Desktop locked state
          isHovered={isSidebarHovered}
          
          onClose={() => setIsMobileMenuOpen(false)}
          onTogglePin={() => {
              setIsSidebarPinned(!isSidebarPinned)
              setIsSidebarHovered(false) // Reset hover on click to prevent sticking
          }}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
         <Header 
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            // Clicking hamburger always PINS it open (Notion behavior)
            onDesktopToggle={() => setIsSidebarPinned(true)} 
            isSidebarOpen={isSidebarPinned}
         />
         <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
         </main>
         <AIChat />
      </div>
    </div>
  )
}
