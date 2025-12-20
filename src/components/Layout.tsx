import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { AIChat } from "./AIChat"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          <AIChat />
        </div>
      </div>
    </div>
  )
}
