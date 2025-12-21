import { BarChart2, BookOpen, Home, Settings, Terminal, Newspaper, ChevronsLeft, Pin } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

const navigation = [
  { name: "Dashboard", href: "/home", icon: Home, protected: true },
  { name: "Learning", href: "/learning", icon: BookOpen, protected: false },
  { name: "Simulator", href: "/simulator", icon: Terminal, protected: true },
  { name: "Backtesting", href: "/backtest", icon: BarChart2, protected: true },
  { name: "News", href: "/news", icon: Newspaper, protected: true },
  { name: "Settings", href: "/settings", icon: Settings, protected: true },
]

interface SidebarProps {
    isOpen: boolean
    isPinned: boolean
    isHovered?: boolean
    onClose: () => void // Used for mobile
    onTogglePin: () => void
    onMouseEnter: () => void
    onMouseLeave: () => void
}

export function Sidebar({ 
    isOpen, 
    isPinned, 
    isHovered = false,
    onClose,
    onTogglePin,
    onMouseEnter,
    onMouseLeave 
}: SidebarProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Filter navigation
  const visibleNavigation = navigation.filter(item => !item.protected || isAuthenticated)

  // Mobile vs Desktop positioning
  // Mobile: Full screen height (inset-0 or inset-y-0) with overlay. Top-0.
  // Desktop: Below header (top-16).
  // We need to conditionally apply top-16 only on md: breakpoint?
  // User said "menu bar should appear... under the top bar".
  // Mobile menu usually covers everything or is also under header?
  // Layout.tsx has Header fixed z-50.
  // If Mobile menu is `z-50` it might conflict. Let's make mobile menu `z-[51]`? Or make sidebar `z-40` globally and respect header?
  // Let's stick to Desktop request: `md:top-16 md:h-[calc(100vh-4rem)]`.
  // Mobile: `top-16` also? If Header is fixed on mobile, yes.
  // Layout.tsx sets Header fixed for all sizes.
  // So Sidebar should be `top-16` always.

  return (
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />
        )}

        <div 
            // Fixed position, sitting below the 16 (4rem) header
            className={cn(
                "fixed left-0 bottom-0 top-16 w-64 border-r bg-card/95 backdrop-blur shadow-xl transition-transform duration-300 ease-in-out md:shadow-none z-40",
                // Mobile translation
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop translation (Always visible if open OR pinned OR hovered)
                isOpen || isPinned || isHovered ? "md:translate-x-0" : "md:-translate-x-full"
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
           {/* Sidebar Header with "MENU" */}
           <div className="flex h-14 items-center px-6 border-b shrink-0">
                <span className="font-bold tracking-wider text-muted-foreground/70">MENU</span>
           </div>
           
           <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {visibleNavigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Button
                            key={item.name}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start mb-1 px-3",
                                isActive && "bg-secondary text-secondary-foreground font-medium"
                            )}
                            asChild
                            onClick={() => { if (window.innerWidth < 768) onClose() }}
                        >
                            <Link to={item.href}>
                                <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                            </Link>
                        </Button>
                    )
                })}
            </div>
        </div>
    </>
  )
}
