import { useState } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { AIChat } from "./AIChat"
import { GlossaryModal } from "./GlossaryModal"

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <GlossaryModal />
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          <AIChat />
        </div>
      </div>
    </div>
  )
}
