import { BarChart2, BookOpen, Home, Settings, Terminal, Newspaper, ChevronsLeft } from "lucide-react"
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
    onClose: () => void
    
    // Desktop Props
    isDesktopOpen?: boolean
    isHovered?: boolean
    onToggleCollapse?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export function Sidebar({ 
    isOpen, 
    onClose, 
    isDesktopOpen = true, 
    isHovered = false, 
    onToggleCollapse,
    onMouseEnter,
    onMouseLeave 
}: SidebarProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Filter navigation based on authentication
  const visibleNavigation = navigation.filter(item => 
    !item.protected || isAuthenticated
  )

  // Determine Sidebar CSS based on state
  const sidebarClasses = cn(
      // Base
      "fixed inset-y-0 left-0 z-50 flex-col border-r bg-card transition-all duration-300 ease-in-out",
      
      // Mobile: Slide in/out
      isOpen ? "translate-x-0" : "-translate-x-full",
      
      // Desktop: Override mobile translate
      "md:translate-x-0",
      
      // Desktop: Collapsed vs Open vs Hovered
      isDesktopOpen ? "md:static md:w-64" : (
          isHovered ? "md:fixed md:w-64 md:shadow-2xl md:border-r-2" : "md:fixed md:w-0 md:border-0 md:overflow-hidden"
      )
  )

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
            className={sidebarClasses}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
           {/* Header with Title + Collapse Button */}
           <div className="flex h-16 items-center justify-between px-6 border-b">
                <span className="text-lg font-bold md:opacity-100 transition-opacity whitespace-nowrap">
                   {(!isDesktopOpen && !isHovered) ? "" : "Menu"}
                </span>
                
                {/* Desktop Collapse Button */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={onToggleCollapse}
                >
                    <ChevronsLeft className="h-4 w-4" />
                    <span className="sr-only">Collapse Sidebar</span>
                </Button>
           </div>
           
           <div className="flex-1 space-y-1 p-4 overflow-y-auto overflow-x-hidden">
                {visibleNavigation.map((item) => (
                <Button
                    key={item.name}
                    variant={location.pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                    "w-full justify-start whitespace-nowrap mb-1",
                    location.pathname === item.href && "bg-secondary"
                    )}
                    asChild
                    onClick={() => {
                        // Close menu on mobile when a link is clicked
                        if (window.innerWidth < 768) onClose()
                    }}
                >
                    <Link to={item.href}>
                    <item.icon className="mr-2 h-4 w-4 shrink-0" />
                    {/* Hide text if width is 0 (double check prevention of artifacting) */}
                    <span className={cn(
                        "transition-opacity duration-200",
                        (!isDesktopOpen && !isHovered) ? "opacity-0" : "opacity-100"
                    )}>
                        {item.name}
                    </span>
                    </Link>
                </Button>
                ))}
            </div>
        </div>
    </>
  )
}
