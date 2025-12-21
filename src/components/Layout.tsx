import { useState } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { AIChat } from "./AIChat"
import { GlossaryModal } from "./GlossaryModal"

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Desktop Sidebar State
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  // Combined logic: Sidebar is visible if it's pinned open OR hovered
  // On mobile, we use the separate isMobileMenuOpen state

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <GlossaryModal />
      
      {/* Notion-style Hover Trigger Removed per request - now only strictly on icon hover */}
      {/* {!isSidebarOpen && (
        <div 
          className="fixed inset-y-0 left-0 w-6 z-40 hidden md:block" 
          onMouseEnter={() => setIsSidebarHovered(true)}
        />
      )} */}

      <div className="flex h-screen overflow-hidden relative">
        <Sidebar 
            // Mobile props
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)}
            
            // Desktop props
            isDesktopOpen={isSidebarOpen}
            isHovered={isSidebarHovered}
            onToggleCollapse={() => setSidebarOpen(!isSidebarOpen)}
            onMouseEnter={() => setIsSidebarHovered(true)}
            onMouseLeave={() => setIsSidebarHovered(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <Header 
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            // Pass desktop toggle to Header if we want a button there (optional, logic handles it)
            onDesktopToggle={() => setSidebarOpen(!isSidebarOpen)}
            // Trigger overlay on icon hover
            onMenuHover={() => setIsSidebarHovered(true)}
            isSidebarOpen={isSidebarOpen}
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
