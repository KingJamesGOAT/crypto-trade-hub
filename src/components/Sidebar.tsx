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
            // Fixed position ensures smooth sliding without layout jank
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r bg-card/95 backdrop-blur shadow-xl transition-transform duration-300 ease-in-out md:shadow-none",
                // Mobile translation
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop translation (Always visible if open OR pinned OR hovered)
                isOpen || isPinned || isHovered ? "md:translate-x-0" : "md:-translate-x-full"
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
           {/* Header */}
           <div className="flex h-16 items-center justify-between px-4 border-b">
                <div className="flex items-center gap-2 font-bold text-lg px-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs">CTH</span>
                    </div>
                    <span>CryptoHub</span>
                </div>
                
                {/* Collapse / Pin Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onTogglePin}
                    title={isPinned ? "Close Sidebar" : "Lock Sidebar Open"}
                >
                    {isPinned ? <ChevronsLeft className="h-4 w-4" /> : <Pin className="h-4 w-4 rotate-45" />}
                </Button>
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
